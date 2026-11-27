import net from 'node:net';
import tls from 'node:tls';
import crypto from 'node:crypto';

export interface RfqHardwareLine {
  sku?: string;
  name?: string;
  category?: string;
  quantity?: number;
  unitLabel?: string;
  activeTier?: string;
  unitPriceCad?: number | null;
  lineTotalCad?: number | null;
  pricingNote?: string;
}

export interface RfqVehicleGroup {
  id?: string;
  groupLabel?: string;
  year?: string;
  make?: string;
  model?: string;
  vehicleClass?: string;
  vehicleCount?: number;
  powerSource?: string;
  fitmentStatus?: string;
  fitmentLabel?: string;
}

export interface RfqEmailRecord {
  quoteId: string;
  storefrontId: string;
  brand: string;
  persistedAt: string;
  payload: Record<string, unknown>;
}

export interface EmailRoutingConfig {
  supplierBrand: string;
  pilotStorefrontId: string;
  recipientEmail: string;
  fromEmail: string;
  mode: 'smtp' | 'resend' | 'unconfigured';
  requireEmailDelivery: boolean;
  timeoutMs: number;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  resendApiKey: string;
  configured: boolean;
  missingConfig: string[];
}

export interface EmailDeliveryResult {
  delivered: boolean;
  provider: 'smtp' | 'resend';
  messageId: string;
  recipientMasked: string;
  sentAt: string;
}

export class EmailDeliveryTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailDeliveryTimeoutError';
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoneyCad(amount: number): string {
  return `$${amount.toLocaleString('en-CA')} CAD`;
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [local, domain] = parts;
  if (local.length <= 2) return `${local[0] ?? '*'}*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.min(5, local.length - 1))}@${domain}`;
}

export interface StorefrontRoutingMeta {
  id: 'astrateq' | 'northlink' | 'voltdepot' | 'truenorth';
  code: 'AST' | 'NLT' | 'VDS' | 'TNU';
  brand: string;
  recipientEnvVar: string;
}

export const STOREFRONT_ROUTING_MAP: Record<string, StorefrontRoutingMeta> = {
  astrateq: {
    id: 'astrateq',
    code: 'AST',
    brand: 'Astrateq Gadgets',
    recipientEnvVar: 'RFQ_RECIPIENT_ASTRATEQ',
  },
  northlink: {
    id: 'northlink',
    code: 'NLT',
    brand: 'NorthLink Telematics',
    recipientEnvVar: 'RFQ_RECIPIENT_NORTHLINK',
  },
  voltdepot: {
    id: 'voltdepot',
    code: 'VDS',
    brand: 'VoltDepot Systems',
    recipientEnvVar: 'RFQ_RECIPIENT_VOLTDEPOT',
  },
  truenorth: {
    id: 'truenorth',
    code: 'TNU',
    brand: 'TrueNorth Upfitting',
    recipientEnvVar: 'RFQ_RECIPIENT_TRUENORTH',
  },
};

export function resolveStorefrontRoutingMeta(
  storefrontIdOrCode?: string
): StorefrontRoutingMeta {
  const normalized = (storefrontIdOrCode || 'astrateq').trim().toLowerCase();
  for (const meta of Object.values(STOREFRONT_ROUTING_MAP)) {
    if (meta.id === normalized || meta.code.toLowerCase() === normalized) {
      return meta;
    }
  }
  return STOREFRONT_ROUTING_MAP.astrateq;
}

export function getEmailRoutingConfig(storefrontIdOrCode?: string): EmailRoutingConfig {
  const meta = resolveStorefrontRoutingMeta(storefrontIdOrCode);
  const supplierBrand =
    meta.id === 'astrateq'
      ? process.env.RFQ_SUPPLIER_BRAND?.trim() || meta.brand
      : meta.brand;
  const pilotStorefrontId =
    process.env.RFQ_PILOT_STOREFRONT_ID?.trim().toLowerCase() || meta.id;

  const storefrontSpecificRecipient = process.env[meta.recipientEnvVar]?.trim() || '';
  const sharedFallbackRecipient = process.env.RFQ_RECIPIENT_EMAIL?.trim() || '';
  const recipientEmail = storefrontSpecificRecipient || sharedFallbackRecipient;

  const smtpHost = process.env.SMTP_HOST?.trim() || '';
  const smtpPortRaw = Number(process.env.SMTP_PORT || '587');
  const smtpPort = Number.isFinite(smtpPortRaw) && smtpPortRaw > 0 ? smtpPortRaw : 587;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const smtpUser = process.env.SMTP_USER?.trim() || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || '';
  const fromEmail = process.env.RFQ_FROM_EMAIL?.trim() || smtpUser || '';
  const requireEmailDelivery = process.env.RFQ_REQUIRE_EMAIL_DELIVERY !== 'false';
  const timeoutRaw = Number(process.env.EMAIL_TIMEOUT_MS || '10000');
  const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw >= 1000 ? timeoutRaw : 10000;

  const explicitMode = process.env.EMAIL_DELIVERY_MODE?.trim().toLowerCase();
  let mode: 'smtp' | 'resend' | 'unconfigured' = 'unconfigured';
  if (explicitMode === 'smtp') {
    mode = 'smtp';
  } else if (explicitMode === 'resend') {
    mode = 'resend';
  } else if (resendApiKey) {
    mode = 'resend';
  } else if (smtpHost) {
    mode = 'smtp';
  }

  const missingConfig: string[] = [];
  if (!recipientEmail || !EMAIL_RE.test(recipientEmail)) {
    missingConfig.push(meta.recipientEnvVar);
  }
  if (!fromEmail || !EMAIL_RE.test(fromEmail)) {
    missingConfig.push('RFQ_FROM_EMAIL');
  }

  if (mode === 'unconfigured') {
    missingConfig.push('EMAIL_DELIVERY_MODE (resend or smtp)');
    missingConfig.push('RESEND_API_KEY or SMTP_HOST');
  } else if (mode === 'smtp') {
    if (!smtpHost) {
      missingConfig.push('SMTP_HOST');
    }
    if ((smtpUser && !smtpPass) || (!smtpUser && smtpPass)) {
      missingConfig.push(smtpUser ? 'SMTP_PASS' : 'SMTP_USER');
    }
  } else if (mode === 'resend') {
    if (!resendApiKey) {
      missingConfig.push('RESEND_API_KEY');
    }
  }

  return {
    supplierBrand,
    pilotStorefrontId,
    recipientEmail,
    fromEmail,
    mode,
    requireEmailDelivery,
    timeoutMs,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
    resendApiKey,
    configured: missingConfig.length === 0,
    missingConfig,
  };
}

export function buildRfqEmailContent(
  record: RfqEmailRecord,
  supplierBrand: string
): { subject: string; replyTo: string; text: string; html: string } {
  const payload = record.payload;
  const hardwareLines = Array.isArray(payload.hardwareLines)
    ? (payload.hardwareLines as RfqHardwareLine[])
    : [];
  const vehicleGroups = Array.isArray(payload.vehicleGroups)
    ? (payload.vehicleGroups as RfqVehicleGroup[])
    : [];
  const installationRequested = Boolean(payload.installationCoordinationRequested);
  const deployment =
    typeof payload.deployment === 'object' && payload.deployment !== null
      ? (payload.deployment as Record<string, unknown>)
      : {};
  const contact =
    typeof payload.contact === 'object' && payload.contact !== null
      ? (payload.contact as Record<string, unknown>)
      : {};

  const totalUnits = hardwareLines.reduce(
    (sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0),
    0
  );
  const pricedSubtotal = hardwareLines.reduce(
    (sum, item) => sum + (typeof item.lineTotalCad === 'number' ? item.lineTotalCad : 0),
    0
  );
  const hasFormalQuoteLine =
    installationRequested ||
    hardwareLines.some((item) => item.unitPriceCad === null || item.unitPriceCad === undefined);

  const companyName = String(contact.companyName ?? 'Unknown Company');
  const fullName = String(contact.fullName ?? 'Unknown Contact');
  const workEmail = String(contact.workEmail ?? '');
  const phone = String(contact.phone ?? '');
  const provinceOrRegion = String(contact.provinceOrRegion ?? '').trim();
  const projectNotes = String(contact.projectNotes ?? '').trim();

  const subject = sanitizeHeader(
    `[${supplierBrand} RFQ] ${record.quoteId} — ${companyName} (${totalUnits} units)`
  );
  const replyTo = EMAIL_RE.test(workEmail) ? sanitizeHeader(workEmail) : '';

  const textLines: string[] = [
    `${supplierBrand} — Fleet Request for Quotation`,
    `============================================================`,
    `Quote Reference : ${record.quoteId}`,
    `Submitted At    : ${record.persistedAt}`,
    `Storefront      : ${record.brand} (${record.storefrontId})`,
    ``,
    `1. HARDWARE LINE ITEMS (${hardwareLines.length})`,
    `------------------------------------------------------------`,
  ];

  if (hardwareLines.length === 0) {
    textLines.push('No hardware line items selected.');
  } else {
    for (const line of hardwareLines) {
      const rateText =
        typeof line.unitPriceCad === 'number'
          ? `${formatMoneyCad(line.unitPriceCad)} / ${line.unitLabel || 'unit'}`
          : line.pricingNote || 'Subject to formal fleet quote';
      const totalText =
        typeof line.lineTotalCad === 'number' ? formatMoneyCad(line.lineTotalCad) : 'Formal quote';
      textLines.push(
        `- ${line.sku ?? 'SKU'} | ${line.name ?? 'Hardware Item'} | Qty: ${line.quantity ?? 1} | Tier: ${line.activeTier ?? 'Standard'} | Rate: ${rateText} | Line Total: ${totalText}`
      );
    }
  }

  textLines.push(
    `Installation Coordination Requested: ${installationRequested ? 'Yes (subject to formal fleet quote)' : 'No'}`,
    `Estimated Tiered Subtotal: ${formatMoneyCad(pricedSubtotal)}${hasFormalQuoteLine ? ' + formal quote items' : ''}`,
    ``,
    `2. VEHICLE & DEPLOYMENT REQUIREMENTS (${vehicleGroups.length} group(s))`,
    `------------------------------------------------------------`
  );

  if (vehicleGroups.length === 0) {
    textLines.push('No vehicle groups attached.');
  } else {
    vehicleGroups.forEach((grp, idx) => {
      const labelSuffix = grp.groupLabel ? ` [${grp.groupLabel}]` : '';
      textLines.push(
        `- Group ${idx + 1}${labelSuffix}: ${grp.vehicleCount ?? 1}x ${grp.year ?? ''} ${grp.make ?? ''} ${grp.model ?? ''} (${grp.vehicleClass ?? ''}) | Power: ${grp.powerSource || 'Unspecified'} | Fitment: ${grp.fitmentLabel || grp.fitmentStatus || 'Pending'}`
      );
    });
  }

  const optionalDeploymentFields: Array<[string, unknown]> = [
    ['Vehicle Types', deployment.vehicleTypes],
    ['Tracking Requirements', deployment.trackingRequirements],
    ['Connectivity Preference', deployment.connectivityPreference],
    ['Charging Type', deployment.chargingType],
    ['Charging Bays', deployment.chargingBays],
    ['Site Conditions', deployment.siteConditions],
    ['Electrical Service', deployment.electricalService],
    ['Depot Region', deployment.siteLocation],
    ['Upfitting Hub', deployment.upfitLocation],
    ['Vehicle Use', deployment.vehicleUse],
    ['Required Equipment', deployment.requiredEquipment],
  ];

  textLines.push(
    `Installation Preference : ${String(deployment.installationPreference ?? 'Not specified')}`,
    `Fleet Size              : ${String(deployment.fleetSize ?? 'Not specified')}`,
    `Rollout Timeline        : ${String(deployment.rolloutTimeline ?? 'Not specified')}`
  );
  for (const [label, val] of optionalDeploymentFields) {
    if (typeof val === 'string' && val.trim()) {
      textLines.push(`${label.padEnd(24)}: ${val.trim()}`);
    }
  }
  if (typeof deployment.additionalEquipmentNotes === 'string' && deployment.additionalEquipmentNotes.trim()) {
    textLines.push(`Additional Equip Notes  : ${deployment.additionalEquipmentNotes.trim()}`);
  }

  textLines.push(
    ``,
    `3. BUYER CONTACT INFORMATION`,
    `------------------------------------------------------------`,
    `Contact Name    : ${fullName}`,
    `Business Name   : ${companyName}`,
    `Business Email  : ${workEmail}`,
    `Telephone       : ${phone}`,
    `Province/Region : ${provinceOrRegion || 'Not specified'}`
  );
  if (projectNotes) {
    textLines.push(`Project Info    : ${projectNotes}`);
  }

  const hardwareRowsHtml =
    hardwareLines.length === 0
      ? `<tr><td colspan="5" style="padding:8px;border:1px solid #d1d5db;">No hardware line items selected.</td></tr>`
      : hardwareLines
          .map((line) => {
            const rateText =
              typeof line.unitPriceCad === 'number'
                ? `${formatMoneyCad(line.unitPriceCad)} / ${line.unitLabel || 'unit'}`
                : line.pricingNote || 'Formal quote';
            const totalText =
              typeof line.lineTotalCad === 'number'
                ? formatMoneyCad(line.lineTotalCad)
                : 'Formal quote';
            return `<tr>
              <td style="padding:8px;border:1px solid #d1d5db;font-family:monospace;">${escapeHtml(line.sku ?? '')}</td>
              <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(line.name ?? '')}</td>
              <td style="padding:8px;border:1px solid #d1d5db;text-align:right;">${escapeHtml(line.quantity ?? 1)}</td>
              <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(line.activeTier ?? '')} (${escapeHtml(rateText)})</td>
              <td style="padding:8px;border:1px solid #d1d5db;text-align:right;font-weight:600;">${escapeHtml(totalText)}</td>
            </tr>`;
          })
          .join('');

  const vehicleRowsHtml =
    vehicleGroups.length === 0
      ? `<p style="margin:6px 0;color:#4b5563;">No vehicle groups attached.</p>`
      : `<ul style="margin:6px 0;padding-left:18px;">${vehicleGroups
          .map((grp, idx) => {
            const labelPart = grp.groupLabel ? ` — <em>${escapeHtml(grp.groupLabel)}</em>` : '';
            return `<li style="margin-bottom:4px;"><strong>Group ${idx + 1}</strong>${labelPart}: ${escapeHtml(grp.vehicleCount ?? 1)} &times; ${escapeHtml(grp.year ?? '')} ${escapeHtml(grp.make ?? '')} ${escapeHtml(grp.model ?? '')} (${escapeHtml(grp.vehicleClass ?? '')}) &middot; Power: <code>${escapeHtml(grp.powerSource || 'Unspecified')}</code> &middot; ${escapeHtml(grp.fitmentLabel || grp.fitmentStatus || 'Pending')}</li>`;
          })
          .join('')}</ul>`;

  const html = `<!doctype html>
<html>
  <body style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;margin:0;padding:24px;background:#f8fafc;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;padding:24px;">
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#0284c7;font-weight:700;">${escapeHtml(supplierBrand)} · Fleet RFQ</p>
      <h1 style="margin:0 0 12px;font-size:20px;">Quote Reference: ${escapeHtml(record.quoteId)}</h1>
      <p style="margin:0 0 18px;font-size:13px;color:#475569;">Submitted at ${escapeHtml(record.persistedAt)} via ${escapeHtml(record.brand)} (${escapeHtml(record.storefrontId)}).</p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">1. Hardware Line Items</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:10px;">
        <thead>
          <tr style="background:#f1f5f9;text-align:left;">
            <th style="padding:8px;border:1px solid #d1d5db;">SKU</th>
            <th style="padding:8px;border:1px solid #d1d5db;">Product</th>
            <th style="padding:8px;border:1px solid #d1d5db;text-align:right;">Qty</th>
            <th style="padding:8px;border:1px solid #d1d5db;">Tier / Rate</th>
            <th style="padding:8px;border:1px solid #d1d5db;text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>${hardwareRowsHtml}</tbody>
      </table>
      <p style="font-size:13px;margin:6px 0;"><strong>Installation Coordination:</strong> ${installationRequested ? 'Requested (subject to formal fleet quote)' : 'Not requested'}</p>
      <p style="font-size:13px;margin:6px 0 18px;"><strong>Estimated Tiered Subtotal:</strong> ${escapeHtml(formatMoneyCad(pricedSubtotal))}${hasFormalQuoteLine ? ' + formal quote items' : ''}</p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">2. Vehicle &amp; Deployment Requirements</h2>
      ${vehicleRowsHtml}
      <p style="font-size:13px;margin:6px 0;"><strong>Installation Preference:</strong> ${escapeHtml(deployment.installationPreference ?? 'Not specified')} &middot; <strong>Fleet Size:</strong> ${escapeHtml(deployment.fleetSize ?? 'Not specified')} &middot; <strong>Timeline:</strong> ${escapeHtml(deployment.rolloutTimeline ?? 'Not specified')}</p>
      ${optionalDeploymentFields
        .filter(([, val]) => typeof val === 'string' && val.trim().length > 0)
        .map(
          ([label, val]) =>
            `<p style="font-size:13px;margin:4px 0;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(val).trim())}</p>`
        )
        .join('')}
      ${typeof deployment.additionalEquipmentNotes === 'string' && deployment.additionalEquipmentNotes.trim() ? `<p style="font-size:13px;margin:6px 0 18px;"><strong>Additional Equipment Notes:</strong> ${escapeHtml(deployment.additionalEquipmentNotes.trim())}</p>` : ''}

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-top:18px;">3. Buyer Contact Information</h2>
      <p style="font-size:13px;margin:4px 0;"><strong>Contact Name:</strong> ${escapeHtml(fullName)}</p>
      <p style="font-size:13px;margin:4px 0;"><strong>Business Name:</strong> ${escapeHtml(companyName)}</p>
      <p style="font-size:13px;margin:4px 0;"><strong>Business Email:</strong> ${escapeHtml(workEmail)}</p>
      <p style="font-size:13px;margin:4px 0;"><strong>Telephone:</strong> ${escapeHtml(phone)}</p>
      <p style="font-size:13px;margin:4px 0;"><strong>Province / Region:</strong> ${escapeHtml(provinceOrRegion || 'Not specified')}</p>
      ${projectNotes ? `<p style="font-size:13px;margin:4px 0;"><strong>Additional Project Info:</strong> ${escapeHtml(projectNotes)}</p>` : ''}
    </div>
  </body>
</html>`;

  return {
    subject,
    replyTo,
    text: textLines.join('\n'),
    html,
  };
}

function buildMimeMessage(params: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}): string {
  const boundary = `----=_Part_${crypto.randomBytes(12).toString('hex')}`;
  const messageId = `<${crypto.randomUUID()}@astrateq-rfq.local>`;
  const headers = [
    `From: ${sanitizeHeader(params.from)}`,
    `To: ${sanitizeHeader(params.to)}`,
    ...(params.replyTo ? [`Reply-To: ${sanitizeHeader(params.replyTo)}`] : []),
    `Subject: ${sanitizeHeader(params.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  const body = [
    ...headers,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    params.text,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    params.html,
    ``,
    `--${boundary}--`,
    ``,
  ]
    .join('\r\n')
    // RFC 5321 dot-stuffing for lines starting with '.'
    .replace(/(^|\r\n)\./g, '$1..');

  return body;
}

class SmtpClientSession {
  private socket: net.Socket | tls.TLSSocket;
  private buffer = '';
  private closed = false;
  private pendingResolve: ((resp: { code: number; lines: string[] }) => void) | null = null;
  private pendingReject: ((err: Error) => void) | null = null;

  constructor(socket: net.Socket | tls.TLSSocket, timeoutMs: number) {
    this.socket = socket;
    this.attachListeners(socket, timeoutMs);
  }

  private attachListeners(sock: net.Socket | tls.TLSSocket, timeoutMs: number) {
    sock.setEncoding('utf8');
    sock.setTimeout(timeoutMs);

    sock.on('data', (chunk: string) => {
      this.buffer += chunk;
      this.tryFlushResponse();
    });

    sock.on('timeout', () => {
      const err = new EmailDeliveryTimeoutError(`SMTP connection timed out after ${timeoutMs}ms.`);
      this.fail(err);
      sock.destroy();
    });

    sock.on('error', (err: Error) => {
      this.fail(err);
    });

    sock.on('close', () => {
      this.closed = true;
      if (this.pendingReject) {
        this.fail(new Error('SMTP connection closed unexpectedly.'));
      }
    });
  }

  private fail(err: Error) {
    if (this.pendingReject) {
      const rej = this.pendingReject;
      this.pendingResolve = null;
      this.pendingReject = null;
      rej(err);
    }
  }

  private tryFlushResponse() {
    if (!this.pendingResolve) return;
    const rawLines = this.buffer.split(/\r?\n/);
    // Must end with newline to have at least one complete line
    if (rawLines.length < 2) return;

    const completeLines = rawLines.slice(0, -1);
    const parsedLines: string[] = [];
    for (let i = 0; i < completeLines.length; i++) {
      const line = completeLines[i];
      parsedLines.push(line);
      const match = /^(\d{3})([\s-])(.*)$/.exec(line);
      if (match && match[2] === ' ') {
        const code = Number(match[1]);
        this.buffer = rawLines.slice(i + 1).join('\r\n');
        const resolve = this.pendingResolve;
        this.pendingResolve = null;
        this.pendingReject = null;
        resolve({ code, lines: parsedLines });
        return;
      }
    }
  }

  readResponse(): Promise<{ code: number; lines: string[] }> {
    return new Promise((resolve, reject) => {
      if (this.closed) {
        reject(new Error('SMTP socket is closed.'));
        return;
      }
      this.pendingResolve = resolve;
      this.pendingReject = reject;
      this.tryFlushResponse();
    });
  }

  async command(cmd: string, expectedCodes: number[]): Promise<{ code: number; lines: string[] }> {
    if (this.closed) {
      throw new Error('SMTP socket is closed.');
    }
    this.socket.write(`${cmd}\r\n`);
    const resp = await this.readResponse();
    if (!expectedCodes.includes(resp.code)) {
      throw new Error(`SMTP error (${resp.code}): ${resp.lines.join(' | ')}`);
    }
    return resp;
  }

  async sendData(rawMessage: string, expectedCodes: number[]): Promise<{ code: number; lines: string[] }> {
    if (this.closed) {
      throw new Error('SMTP socket is closed.');
    }
    this.socket.write(`${rawMessage}\r\n.\r\n`);
    const resp = await this.readResponse();
    if (!expectedCodes.includes(resp.code)) {
      throw new Error(`SMTP DATA rejected (${resp.code}): ${resp.lines.join(' | ')}`);
    }
    return resp;
  }

  upgradeTls(host: string, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const plain = this.socket as net.Socket;
      plain.removeAllListeners('data');
      plain.removeAllListeners('timeout');
      plain.removeAllListeners('error');
      plain.removeAllListeners('close');
      const secureSock = tls.connect(
        {
          socket: plain,
          servername: host,
        },
        () => {
          this.socket = secureSock;
          this.buffer = '';
          this.attachListeners(secureSock, timeoutMs);
          resolve();
        }
      );
      secureSock.once('error', (err) => {
        reject(err);
      });
    });
  }

  close() {
    if (!this.closed) {
      this.closed = true;
      this.socket.end();
    }
  }
}

async function sendViaSmtp(
  config: EmailRoutingConfig,
  content: { subject: string; replyTo: string; text: string; html: string }
): Promise<EmailDeliveryResult> {
  const socket = await new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
    let settled = false;
    const sock = config.smtpSecure
      ? tls.connect({ host: config.smtpHost, port: config.smtpPort, servername: config.smtpHost })
      : net.createConnection({ host: config.smtpHost, port: config.smtpPort });

    sock.setTimeout(config.timeoutMs);
    sock.once('timeout', () => {
      if (!settled) {
        settled = true;
        sock.destroy();
        reject(new EmailDeliveryTimeoutError(`SMTP connection timed out after ${config.timeoutMs}ms.`));
      }
    });
    sock.once('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
    sock.once(config.smtpSecure ? 'secureConnect' : 'connect', () => {
      if (!settled) {
        settled = true;
        resolve(sock);
      }
    });
  });

  const session = new SmtpClientSession(socket, config.timeoutMs);
  try {
    const greeting = await session.readResponse();
    if (greeting.code !== 220) {
      throw new Error(`Unexpected SMTP greeting (${greeting.code}): ${greeting.lines.join(' ')}`);
    }

    let ehlo = await session.command('EHLO astrateq-rfq.local', [250]);
    const supportsStartTls = ehlo.lines.some((line) => /STARTTLS/i.test(line));
    if (!config.smtpSecure && supportsStartTls) {
      await session.command('STARTTLS', [220]);
      await session.upgradeTls(config.smtpHost, config.timeoutMs);
      ehlo = await session.command('EHLO astrateq-rfq.local', [250]);
    }

    if (config.smtpUser && config.smtpPass) {
      const authLine = ehlo.lines.find((line) => /AUTH\b/i.test(line)) ?? '';
      if (/PLAIN/i.test(authLine) || !/LOGIN/i.test(authLine)) {
        const token = Buffer.from(`\0${config.smtpUser}\0${config.smtpPass}`, 'utf8').toString('base64');
        await session.command(`AUTH PLAIN ${token}`, [235]);
      } else {
        await session.command('AUTH LOGIN', [334]);
        await session.command(Buffer.from(config.smtpUser, 'utf8').toString('base64'), [334]);
        await session.command(Buffer.from(config.smtpPass, 'utf8').toString('base64'), [235]);
      }
    }

    await session.command(`MAIL FROM:<${sanitizeHeader(config.fromEmail)}>`, [250]);
    await session.command(`RCPT TO:<${sanitizeHeader(config.recipientEmail)}>`, [250, 251]);
    await session.command('DATA', [354]);

    const mime = buildMimeMessage({
      from: config.fromEmail,
      to: config.recipientEmail,
      replyTo: content.replyTo,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
    const dataResp = await session.sendData(mime, [250]);
    await session.command('QUIT', [221]).catch(() => undefined);

    return {
      delivered: true,
      provider: 'smtp',
      messageId: dataResp.lines.join(' ').trim() || `smtp-${Date.now()}`,
      recipientMasked: maskEmail(config.recipientEmail),
      sentAt: new Date().toISOString(),
    };
  } finally {
    session.close();
  }
}

async function sendViaResend(
  config: EmailRoutingConfig,
  content: { subject: string; replyTo: string; text: string; html: string }
): Promise<EmailDeliveryResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [config.recipientEmail],
        ...(content.replyTo ? { reply_to: content.replyTo } : {}),
        subject: content.subject,
        text: content.text,
        html: content.html,
      }),
      signal: controller.signal,
    });

    let body: Record<string, unknown> | null = null;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      body = null;
    }

    if (!response.ok) {
      const apiMsg =
        body && typeof body.message === 'string'
          ? body.message
          : `Email provider returned HTTP ${response.status}`;
      throw new Error(apiMsg);
    }

    const messageId =
      body && typeof body.id === 'string' ? body.id : `resend-${Date.now()}`;
    return {
      delivered: true,
      provider: 'resend',
      messageId,
      recipientMasked: maskEmail(config.recipientEmail),
      sentAt: new Date().toISOString(),
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new EmailDeliveryTimeoutError(
        `Email API request timed out after ${config.timeoutMs}ms.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function sendRfqEmail(
  record: RfqEmailRecord,
  config: EmailRoutingConfig = getEmailRoutingConfig()
): Promise<EmailDeliveryResult> {
  if (!config.configured) {
    throw new Error(
      `Email routing is not configured. Missing: ${config.missingConfig.join(', ')}.`
    );
  }

  const content = buildRfqEmailContent(record, config.supplierBrand);

  if (config.mode === 'resend') {
    return sendViaResend(config, content);
  }

  if (config.mode === 'smtp') {
    return sendViaSmtp(config, content);
  }

  throw new Error('No supported email delivery mode is configured.');
}
