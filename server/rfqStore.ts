import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export type RfqRecordStatus = 'delivered' | 'delivery_failed' | 'configuration_error';

export interface PersistedEmailDeliveryMeta {
  configured: boolean;
  attempted: boolean;
  delivered: boolean;
  provider?: 'smtp' | 'resend';
  recipientMasked?: string;
  messageId?: string;
  sentAt?: string;
  error?: string;
  missingConfig?: string[];
}

export interface PersistedRfqEntry {
  quoteId: string;
  idempotencyKey: string;
  payloadHash: string;
  storefrontId: string;
  storefrontCode: string;
  brand: string;
  status: RfqRecordStatus;
  persistedAt: string;
  updatedAt: string;
  emailDelivery: PersistedEmailDeliveryMeta;
  payload: Record<string, unknown>;
}

export interface StorageBackendInfo {
  backend: 'vercel-kv' | 'upstash-redis' | 'local-json' | 'vercel-tmp-ephemeral' | 'none';
  durable: boolean;
  configuredForServerless: boolean;
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const LOCK_TTL_SECONDS = 20;

const memoryLocks = new Map<string, Promise<void>>();

function getRedisRestConfig(): {
  url: string;
  token: string;
  backend: 'vercel-kv' | 'upstash-redis';
} | null {
  const kvUrl = process.env.KV_REST_API_URL?.trim();
  const kvToken = process.env.KV_REST_API_TOKEN?.trim();
  if (kvUrl && kvToken) {
    return { url: kvUrl.replace(/\/+$/, ''), token: kvToken, backend: 'vercel-kv' };
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (upstashUrl && upstashToken) {
    return { url: upstashUrl.replace(/\/+$/, ''), token: upstashToken, backend: 'upstash-redis' };
  }

  return null;
}

export function getStorageBackendInfo(): StorageBackendInfo {
  const redis = getRedisRestConfig();
  if (redis) {
    return {
      backend: redis.backend,
      durable: true,
      configuredForServerless: true,
    };
  }

  const isVercel = process.env.VERCEL === '1';
  if (isVercel) {
    if (process.env.RFQ_REQUIRE_DURABLE_STORAGE === 'true') {
      return {
        backend: 'none',
        durable: false,
        configuredForServerless: false,
      };
    }
    return {
      backend: 'vercel-tmp-ephemeral',
      durable: false,
      configuredForServerless: false,
    };
  }

  return {
    backend: 'local-json',
    durable: true,
    configuredForServerless: false,
  };
}

function getLocalStorePath(): string {
  if (process.env.VERCEL === '1') {
    return path.join('/tmp', 'astrateq-rfq-submissions.json');
  }
  return path.resolve(process.cwd(), 'data', 'rfq-submissions.json');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export function computeCanonicalPayloadHash(canonicalPayload: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(stableStringify(canonicalPayload)).digest('hex');
}

function idempDigest(idempotencyKey: string): string {
  return crypto.createHash('sha256').update(idempotencyKey).digest('hex');
}

async function execRedisCommand<T = unknown>(command: Array<string | number>): Promise<T> {
  const cfg = getRedisRestConfig();
  if (!cfg) {
    throw new Error('Redis REST store is not configured.');
  }
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    throw new Error(`Idempotency store returned HTTP ${res.status}.`);
  }
  const json = (await res.json()) as { result?: T; error?: string };
  if (json.error) {
    throw new Error(`Idempotency store error: ${json.error}`);
  }
  return json.result as T;
}

async function readLocalEntries(): Promise<PersistedRfqEntry[]> {
  const filePath = getLocalStorePath();
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PersistedRfqEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalEntries(entries: PersistedRfqEntry[]): Promise<void> {
  const filePath = getLocalStorePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function withIdempotencyLock<T>(
  idempotencyKey: string,
  fn: () => Promise<T>
): Promise<T> {
  const digest = idempDigest(idempotencyKey);
  const previous = memoryLocks.get(digest) ?? Promise.resolve();
  let releaseMemory!: () => void;
  const current = new Promise<void>((resolve) => {
    releaseMemory = resolve;
  });
  memoryLocks.set(digest, current);
  await previous;

  const redis = getRedisRestConfig();
  const lockKey = `rfq:lock:${digest}`;
  let acquiredRedisLock = false;

  try {
    if (redis) {
      const lockRes = await execRedisCommand<string | null>([
        'SET',
        lockKey,
        '1',
        'NX',
        'EX',
        LOCK_TTL_SECONDS,
      ]);
      acquiredRedisLock = lockRes === 'OK';
    }
    return await fn();
  } finally {
    if (redis && acquiredRedisLock) {
      await execRedisCommand(['DEL', lockKey]).catch(() => undefined);
    }
    releaseMemory();
    if (memoryLocks.get(digest) === current) {
      memoryLocks.delete(digest);
    }
  }
}

export async function findRfqByIdempotencyKey(
  idempotencyKey: string
): Promise<PersistedRfqEntry | null> {
  const info = getStorageBackendInfo();
  if (info.backend === 'none') {
    return null;
  }

  if (info.backend === 'vercel-kv' || info.backend === 'upstash-redis') {
    const raw = await execRedisCommand<string | null>([
      'GET',
      `rfq:idemp:${idempDigest(idempotencyKey)}`,
    ]);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedRfqEntry;
    } catch {
      return null;
    }
  }

  const entries = await readLocalEntries();
  return entries.find((e) => e.idempotencyKey === idempotencyKey) ?? null;
}

export async function findRfqByQuoteId(quoteId: string): Promise<PersistedRfqEntry | null> {
  const info = getStorageBackendInfo();
  if (info.backend === 'none') {
    return null;
  }

  if (info.backend === 'vercel-kv' || info.backend === 'upstash-redis') {
    const raw = await execRedisCommand<string | null>([`GET`, `rfq:quote:${quoteId}`]);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedRfqEntry;
    } catch {
      return null;
    }
  }

  const entries = await readLocalEntries();
  return entries.find((e) => e.quoteId === quoteId) ?? null;
}

export async function generateUniqueQuoteId(storefrontCode: string): Promise<string> {
  const info = getStorageBackendInfo();
  const usedIds = new Set<string>();

  if (info.backend === 'local-json' || info.backend === 'vercel-tmp-ephemeral') {
    const existing = await readLocalEntries();
    for (const item of existing) {
      usedIds.add(item.quoteId);
    }
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const digits = String(crypto.randomInt(100000, 1000000));
    const candidate = `RFQ-${storefrontCode}-${digits}`;
    if (usedIds.has(candidate)) {
      continue;
    }
    if (info.backend === 'vercel-kv' || info.backend === 'upstash-redis') {
      const exists = await execRedisCommand<string | null>([
        'GET',
        `rfq:quote:${candidate}`,
      ]).catch(() => null);
      if (exists) continue;
    }
    return candidate;
  }

  return `RFQ-${storefrontCode}-${Date.now().toString().slice(-6)}`;
}

export async function saveRfqEntry(entry: PersistedRfqEntry): Promise<boolean> {
  const info = getStorageBackendInfo();
  if (info.backend === 'none') {
    return false;
  }

  if (info.backend === 'vercel-kv' || info.backend === 'upstash-redis') {
    const serialized = JSON.stringify(entry);
    await execRedisCommand([
      'SET',
      `rfq:idemp:${idempDigest(entry.idempotencyKey)}`,
      serialized,
      'EX',
      DEFAULT_TTL_SECONDS,
    ]);
    await execRedisCommand([
      'SET',
      `rfq:quote:${entry.quoteId}`,
      serialized,
      'EX',
      DEFAULT_TTL_SECONDS,
    ]);
    await execRedisCommand(['LPUSH', 'rfq:recent_ids', entry.quoteId]).catch(() => undefined);
    await execRedisCommand(['LTRIM', 'rfq:recent_ids', 0, 199]).catch(() => undefined);
    return true;
  }

  const entries = await readLocalEntries();
  const idx = entries.findIndex((e) => e.idempotencyKey === entry.idempotencyKey);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  await writeLocalEntries(entries);
  return true;
}

export async function readAllRfqEntries(): Promise<PersistedRfqEntry[]> {
  const info = getStorageBackendInfo();
  if (info.backend === 'none') {
    return [];
  }

  if (info.backend === 'vercel-kv' || info.backend === 'upstash-redis') {
    const ids = await execRedisCommand<string[]>(['LRANGE', 'rfq:recent_ids', 0, 199]).catch(
      () => []
    );
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    const results: PersistedRfqEntry[] = [];
    for (const id of ids) {
      const record = await findRfqByQuoteId(id).catch(() => null);
      if (record) results.push(record);
    }
    return results;
  }

  return readLocalEntries();
}
