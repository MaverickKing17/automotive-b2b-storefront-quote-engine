import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  EmailDeliveryTimeoutError,
  getEmailRoutingConfig,
  sendRfqEmail,
} from './server/rfqEmail';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const RFQ_STORE_FILE = path.join(DATA_DIR, 'rfq-submissions.json');

const STOREFRONT_CODE_MAP: Record<string, string> = {
  astrateq: 'AST',
  northlink: 'NLT',
  voltdepot: 'VDS',
  truenorth: 'TNU',
};

interface PersistedEmailDeliveryMeta {
  configured: boolean;
  attempted: boolean;
  delivered: boolean;
  provider?: 'smtp' | 'resend';
  recipientMasked?: string;
  messageId?: string;
  sentAt?: string;
  missingConfig?: string[];
}

interface PersistedRfqEntry {
  quoteId: string;
  idempotencyKey: string;
  storefrontId: string;
  brand: string;
  persistedAt: string;
  emailDelivery?: PersistedEmailDeliveryMeta;
  payload: Record<string, unknown>;
}

function generateUniqueQuoteId(storefrontId: string, existing: PersistedRfqEntry[]): string {
  const code = STOREFRONT_CODE_MAP[storefrontId] || 'RFQ';
  const usedIds = new Set(existing.map((e) => e.quoteId));
  for (let attempt = 0; attempt < 20; attempt++) {
    const digits = String(crypto.randomInt(100000, 1000000));
    const candidate = `RFQ-${code}-${digits}`;
    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }
  return `RFQ-${code}-${Date.now().toString().slice(-6)}`;
}

function isAuthorizedAdminRequest(req: express.Request): { ok: boolean; status: number; error?: string } {
  const expected = process.env.RFQ_ADMIN_TOKEN?.trim() || '';
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: 'RFQ read endpoints require RFQ_ADMIN_TOKEN to be configured on the server.',
    };
  }
  const authHeader = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  const supplied = match ? match[1].trim() : '';
  const expectedBuf = Buffer.from(expected, 'utf8');
  const suppliedBuf = Buffer.from(supplied, 'utf8');
  if (
    suppliedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(suppliedBuf, expectedBuf)
  ) {
    return { ok: false, status: 401, error: 'Unauthorized.' };
  }
  return { ok: true, status: 200 };
}

async function readRfqStore(): Promise<PersistedRfqEntry[]> {
  try {
    const raw = await fs.readFile(RFQ_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PersistedRfqEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeRfqStore(entries: PersistedRfqEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RFQ_STORE_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.parse.failed') {
      res.status(400).json({ ok: false, error: 'Malformed JSON request body.' });
      return;
    }
    next(err);
  });

  app.get('/api/health', async (_req, res) => {
    const entries = await readRfqStore();
    const emailConfig = getEmailRoutingConfig();
    res.json({
      status: 'ok',
      persistedRfqCount: entries.length,
      pilotSupplierBrand: emailConfig.supplierBrand,
      pilotStorefrontId: emailConfig.pilotStorefrontId,
      emailDelivery: {
        configured: emailConfig.configured,
        mode: emailConfig.mode,
        requireEmailDelivery: emailConfig.requireEmailDelivery,
        missingConfig: emailConfig.missingConfig,
      },
    });
  });

  app.get('/api/rfq', async (req, res) => {
    const auth = isAuthorizedAdminRequest(req);
    if (!auth.ok) {
      res.status(auth.status).json({ error: auth.error });
      return;
    }
    const storefrontFilter =
      typeof req.query.storefront === 'string' ? req.query.storefront.trim().toLowerCase() : '';
    const entries = await readRfqStore();
    const filtered = storefrontFilter
      ? entries.filter((e) => e.storefrontId.toLowerCase() === storefrontFilter)
      : entries;
    res.json({ count: filtered.length, submissions: filtered });
  });

  app.get('/api/rfq/:quoteId', async (req, res) => {
    const auth = isAuthorizedAdminRequest(req);
    if (!auth.ok) {
      res.status(auth.status).json({ error: auth.error });
      return;
    }
    const entries = await readRfqStore();
    const match = entries.find((e) => e.quoteId === req.params.quoteId);
    if (!match) {
      res.status(404).json({ error: 'RFQ submission not found.' });
      return;
    }
    res.json({ submission: match });
  });

  app.post('/api/rfq', async (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ ok: false, error: 'Invalid JSON RFQ payload.' });
      return;
    }

    const idempotencyKey =
      typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
    const storefrontId =
      typeof body.storefrontId === 'string' ? body.storefrontId.trim().toLowerCase() : '';
    const brand = typeof body.brand === 'string' ? body.brand.trim() : '';
    const contact = body.contact as Record<string, unknown> | undefined;

    if (!idempotencyKey || !storefrontId || !brand) {
      res.status(400).json({
        ok: false,
        error: 'Missing required RFQ identifiers (idempotencyKey, storefrontId, brand).',
      });
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(STOREFRONT_CODE_MAP, storefrontId)) {
      res.status(400).json({
        ok: false,
        error: 'Unsupported storefrontId in RFQ payload.',
      });
      return;
    }

    if (
      !contact ||
      typeof contact.fullName !== 'string' ||
      !contact.fullName.trim() ||
      typeof contact.companyName !== 'string' ||
      !contact.companyName.trim() ||
      typeof contact.workEmail !== 'string' ||
      !contact.workEmail.trim() ||
      typeof contact.phone !== 'string' ||
      !contact.phone.trim()
    ) {
      res.status(400).json({
        ok: false,
        error:
          'Complete procurement contact details (fullName, companyName, workEmail, phone) are required.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.workEmail.trim())) {
      res.status(400).json({ ok: false, error: 'A valid business email address is required.' });
      return;
    }

    if (contact.phone.replace(/\D/g, '').length < 7) {
      res.status(400).json({
        ok: false,
        error: 'A valid contact telephone number (at least 7 digits) is required.',
      });
      return;
    }

    const hardwareLines = Array.isArray(body.hardwareLines) ? body.hardwareLines : [];
    const deploymentGroups = Array.isArray(body.vehicleGroups) ? body.vehicleGroups : [];
    const installationRequested = Boolean(body.installationCoordinationRequested);

    if (hardwareLines.length === 0 && deploymentGroups.length === 0 && !installationRequested) {
      res.status(400).json({
        ok: false,
        error: 'Include at least one hardware item, vehicle group, or installation coordination request.',
      });
      return;
    }

    const invalidLine = hardwareLines.some((line) => {
      if (!line || typeof line !== 'object') return true;
      const qty = (line as { quantity?: unknown }).quantity;
      return typeof qty !== 'number' || !Number.isFinite(qty) || qty < 1;
    });
    if (invalidLine) {
      res.status(400).json({
        ok: false,
        error: 'All hardware line items must have a quantity of at least 1.',
      });
      return;
    }

    const invalidGroup = deploymentGroups.some((grp) => {
      if (!grp || typeof grp !== 'object') return true;
      const count = (grp as { vehicleCount?: unknown }).vehicleCount;
      const ps = (grp as { powerSource?: unknown }).powerSource;
      return (
        typeof count !== 'number' ||
        !Number.isFinite(count) ||
        count < 1 ||
        typeof ps !== 'string' ||
        !ps.trim()
      );
    });
    if (invalidGroup) {
      res.status(400).json({
        ok: false,
        error: 'Every attached vehicle group must specify vehicle count >= 1 and a vehicle power source.',
      });
      return;
    }

    const existingEntries = await readRfqStore();
    const duplicate = existingEntries.find((e) => e.idempotencyKey === idempotencyKey);
    if (duplicate) {
      const dupEmailMeta = duplicate.emailDelivery ?? {
        configured: false,
        attempted: false,
        delivered: false,
      };
      res.status(200).json({
        ok: true,
        deduplicated: true,
        quoteId: duplicate.quoteId,
        persistedAt: duplicate.persistedAt,
        storageBackend: 'express-local-json',
        externalDeliveryConfigured: Boolean(dupEmailMeta.delivered),
        emailDelivery: dupEmailMeta,
        record: duplicate,
      });
      return;
    }

    const quoteId = generateUniqueQuoteId(storefrontId, existingEntries);
    const persistedAt = new Date().toISOString();
    const storedPayload: Record<string, unknown> = {
      ...body,
      quoteId,
      persistedAt,
    };

    const emailConfig = getEmailRoutingConfig();
    const routeEmailForStorefront =
      storefrontId === emailConfig.pilotStorefrontId ||
      process.env.RFQ_ROUTE_ALL_STOREFRONTS === 'true';

    let emailDeliveryMeta: PersistedEmailDeliveryMeta = {
      configured: emailConfig.configured,
      attempted: false,
      delivered: false,
      ...(emailConfig.configured ? {} : { missingConfig: emailConfig.missingConfig }),
    };

    if (routeEmailForStorefront) {
      if (emailConfig.configured) {
        try {
          const delivery = await sendRfqEmail(
            {
              quoteId,
              storefrontId,
              brand,
              persistedAt,
              payload: storedPayload,
            },
            emailConfig
          );
          emailDeliveryMeta = {
            configured: true,
            attempted: true,
            delivered: delivery.delivered,
            provider: delivery.provider,
            recipientMasked: delivery.recipientMasked,
            messageId: delivery.messageId,
            sentAt: delivery.sentAt,
          };
        } catch (err) {
          const isTimeout = err instanceof EmailDeliveryTimeoutError;
          const msg = err instanceof Error ? err.message : 'Unknown email transport error.';
          res.status(isTimeout ? 504 : 502).json({
            ok: false,
            error: `RFQ email delivery failed: ${msg}`,
            emailDelivery: {
              configured: true,
              attempted: true,
              delivered: false,
            },
          });
          return;
        }
      } else if (emailConfig.requireEmailDelivery) {
        res.status(503).json({
          ok: false,
          error: `RFQ email routing is required but not configured. Missing: ${emailConfig.missingConfig.join(', ')}.`,
          emailDelivery: {
            configured: false,
            attempted: false,
            delivered: false,
            missingConfig: emailConfig.missingConfig,
          },
        });
        return;
      }
    }

    const newEntry: PersistedRfqEntry = {
      quoteId,
      idempotencyKey,
      storefrontId,
      brand,
      persistedAt,
      emailDelivery: emailDeliveryMeta,
      payload: storedPayload,
    };

    await writeRfqStore([newEntry, ...existingEntries]);
    res.status(201).json({
      ok: true,
      deduplicated: false,
      quoteId,
      persistedAt,
      storageBackend: 'express-local-json',
      externalDeliveryConfigured: Boolean(emailDeliveryMeta.delivered),
      emailDelivery: emailDeliveryMeta,
      record: newEntry,
    });
  });

  return app;
}

async function startServer() {
  const app = createApiApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Fleet storefront & RFQ server listening on http://0.0.0.0:${port}`);
  });
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
