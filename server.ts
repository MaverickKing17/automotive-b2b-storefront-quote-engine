import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmailRoutingConfig } from './server/rfqEmail';
import { processRfqSubmission } from './server/rfqCore';
import {
  findRfqByQuoteId,
  getStorageBackendInfo,
  readAllRfqEntries,
} from './server/rfqStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.parse.failed') {
      res.status(400).json({ ok: false, code: 'VALIDATION_ERROR', error: 'Malformed JSON request body.' });
      return;
    }
    if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.too.large') {
      res.status(413).json({ ok: false, code: 'VALIDATION_ERROR', error: 'Request body exceeds 1 MB limit.' });
      return;
    }
    next(err);
  });

  app.get('/api/health', async (_req, res) => {
    const entries = await readAllRfqEntries().catch(() => []);
    const emailConfig = getEmailRoutingConfig('astrateq');
    const storageInfo = getStorageBackendInfo();
    res.json({
      status: 'ok',
      persistedRfqCount: entries.length,
      pilotSupplierBrand: emailConfig.supplierBrand,
      pilotStorefrontId: emailConfig.pilotStorefrontId,
      storage: storageInfo,
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
    const entries = await readAllRfqEntries();
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
    const match = await findRfqByQuoteId(req.params.quoteId);
    if (!match) {
      res.status(404).json({ error: 'RFQ submission not found.' });
      return;
    }
    res.json({ submission: match });
  });

  app.post('/api/rfq', async (req, res) => {
    if (!req.is('application/json') && !req.is('application/*+json')) {
      res.status(415).json({
        ok: false,
        code: 'UNSUPPORTED_MEDIA_TYPE',
        error: 'Unsupported Content-Type. Use application/json.',
      });
      return;
    }

    try {
      const result = await processRfqSubmission(req.body);
      res.setHeader('Cache-Control', 'no-store');
      res.status(result.httpStatus).json(result.body);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected server error.';
      res.status(500).json({
        ok: false,
        code: 'INTERNAL_ERROR',
        error: `Failed to process RFQ submission: ${message}`,
      });
    }
  });

  app.all('/api/rfq', (_req, res) => {
    res.setHeader('Allow', 'POST');
    res.status(405).json({
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
      error: 'Method not allowed. Send a POST request with application/json.',
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
