import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const RFQ_STORE_FILE = path.join(DATA_DIR, 'rfq-submissions.json');

interface PersistedRfqEntry {
  quoteId: string;
  idempotencyKey: string;
  storefrontId: string;
  brand: string;
  persistedAt: string;
  payload: Record<string, unknown>;
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

    const quoteId = typeof body.quoteId === 'string' ? body.quoteId.trim() : '';
    const idempotencyKey =
      typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : quoteId;
    const storefrontId = typeof body.storefrontId === 'string' ? body.storefrontId.trim() : '';
    const brand = typeof body.brand === 'string' ? body.brand.trim() : '';
    const contact = body.contact as Record<string, unknown> | undefined;

    if (!quoteId || !idempotencyKey || !storefrontId || !brand) {
      res.status(400).json({
        error: 'Missing required RFQ identifiers (quoteId, idempotencyKey, storefrontId, brand).',
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
        error: 'Complete procurement contact details (fullName, companyName, workEmail, phone) are required.',
      });
      return;
    }

    const hardwareLines = Array.isArray(body.hardwareLines) ? body.hardwareLines : [];
    const deploymentGroups = Array.isArray(body.vehicleGroups) ? body.vehicleGroups : [];
    const installationRequested = Boolean(body.installationCoordinationRequested);

    if (hardwareLines.length === 0 && deploymentGroups.length === 0 && !installationRequested) {
      res.status(400).json({
        error: 'Include at least one hardware item, deployment group, or installation service.',
      });
      return;
    }

    const existingEntries = await readRfqStore();
    const duplicate = existingEntries.find((e) => e.idempotencyKey === idempotencyKey);
    if (duplicate) {
      res.status(200).json({
        ok: true,
        deduplicated: true,
        persistedAt: duplicate.persistedAt,
        record: duplicate,
      });
      return;
    }

    const newEntry: PersistedRfqEntry = {
      quoteId,
      idempotencyKey,
      storefrontId,
      brand,
      persistedAt: new Date().toISOString(),
      payload: body,
    };

    await writeRfqStore([newEntry, ...existingEntries]);
    res.status(201).json({
      ok: true,
      deduplicated: false,
      persistedAt: newEntry.persistedAt,
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
