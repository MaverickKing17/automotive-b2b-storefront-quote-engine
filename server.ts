import express from 'express';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

interface PersistedRfqEntry {
  quoteId: string;
  idempotencyKey: string;
  storefrontId: string;
  brand: string;
  persistedAt: string;
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

  app.get('/api/health', async (_req, res) => {
    const entries = await readRfqStore();
    res.json({ status: 'ok', persistedRfqCount: entries.length });
  });

  app.get('/api/rfq', async (req, res) => {
    const storefrontFilter =
      typeof req.query.storefront === 'string' ? req.query.storefront.trim().toLowerCase() : '';
    const entries = await readRfqStore();
    const filtered = storefrontFilter
      ? entries.filter((e) => e.storefrontId.toLowerCase() === storefrontFilter)
      : entries;
    res.json({ count: filtered.length, submissions: filtered });
  });

  app.get('/api/rfq/:quoteId', async (req, res) => {
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
      res.status(400).json({ error: 'Invalid JSON RFQ payload.' });
      return;
    }

    const idempotencyKey =
      typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
    const storefrontId = typeof body.storefrontId === 'string' ? body.storefrontId.trim() : '';
    const brand = typeof body.brand === 'string' ? body.brand.trim() : '';
    const contact = body.contact as Record<string, unknown> | undefined;

    if (!idempotencyKey || !storefrontId || !brand) {
      res.status(400).json({
        error: 'Missing required RFQ identifiers (idempotencyKey, storefrontId, brand).',
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
        error:
          'Complete procurement contact details (fullName, companyName, workEmail, phone) are required.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.workEmail.trim())) {
      res.status(400).json({ error: 'A valid business email address is required.' });
      return;
    }

    const hardwareLines = Array.isArray(body.hardwareLines) ? body.hardwareLines : [];
    const deploymentGroups = Array.isArray(body.vehicleGroups) ? body.vehicleGroups : [];
    const installationRequested = Boolean(body.installationCoordinationRequested);

    if (hardwareLines.length === 0 && deploymentGroups.length === 0 && !installationRequested) {
      res.status(400).json({
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
      res.status(400).json({ error: 'All hardware line items must have a quantity of at least 1.' });
      return;
    }

    const missingPowerSource = deploymentGroups.some((grp) => {
      if (!grp || typeof grp !== 'object') return true;
      const ps = (grp as { powerSource?: unknown }).powerSource;
      return typeof ps !== 'string' || !ps.trim();
    });
    if (missingPowerSource) {
      res.status(400).json({
        error: 'Every attached vehicle group must specify a vehicle power source.',
      });
      return;
    }

    const existingEntries = await readRfqStore();
    const duplicate = existingEntries.find((e) => e.idempotencyKey === idempotencyKey);
    if (duplicate) {
      res.status(200).json({
        ok: true,
        deduplicated: true,
        quoteId: duplicate.quoteId,
        persistedAt: duplicate.persistedAt,
        storageBackend: 'express-local-json',
        externalDeliveryConfigured: false,
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

    const newEntry: PersistedRfqEntry = {
      quoteId,
      idempotencyKey,
      storefrontId,
      brand,
      persistedAt,
      payload: storedPayload,
    };

    await writeRfqStore([newEntry, ...existingEntries]);
    res.status(201).json({
      ok: true,
      deduplicated: false,
      quoteId,
      persistedAt,
      storageBackend: 'express-local-json',
      externalDeliveryConfigured: false,
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
