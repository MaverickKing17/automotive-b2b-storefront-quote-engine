import type { IncomingMessage, ServerResponse } from 'node:http';
import { processRfqSubmission } from '../server/rfqCore';

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

type NodeVercelRequest = IncomingMessage & {
  body?: unknown;
};

class PayloadTooLargeError extends Error {}
class MalformedJsonError extends Error {}

function sendJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function isJsonContentType(contentTypeHeader: string | string[] | undefined): boolean {
  const raw = Array.isArray(contentTypeHeader) ? contentTypeHeader[0] : contentTypeHeader;
  if (!raw) return false;
  const mediaType = raw.split(';')[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || mediaType.endsWith('+json');
}

async function parseJsonRequestBody(req: NodeVercelRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
        throw new PayloadTooLargeError('Request body exceeds 1 MB limit.');
      }
      try {
        return JSON.parse(req.body);
      } catch {
        throw new MalformedJsonError('Malformed JSON request body.');
      }
    }
    if (Buffer.isBuffer(req.body)) {
      if (req.body.byteLength > MAX_BODY_BYTES) {
        throw new PayloadTooLargeError('Request body exceeds 1 MB limit.');
      }
      try {
        return JSON.parse(req.body.toString('utf8'));
      } catch {
        throw new MalformedJsonError('Malformed JSON request body.');
      }
    }
    return req.body;
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    req.on('data', (chunk: Buffer | string) => {
      if (settled) return;
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8');
      totalBytes += buf.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        settled = true;
        reject(new PayloadTooLargeError('Request body exceeds 1 MB limit.'));
        req.destroy();
        return;
      }
      chunks.push(buf);
    });

    req.on('end', () => {
      if (settled) return;
      settled = true;
      const text = Buffer.concat(chunks).toString('utf8').trim();
      if (!text) {
        reject(new MalformedJsonError('Request body must not be empty.'));
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch {
        reject(new MalformedJsonError('Malformed JSON request body.'));
      }
    });

    req.on('error', (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });
  });
}

export default async function handler(
  req: NodeVercelRequest,
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, {
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
      error: 'Method not allowed. Send a POST request with application/json.',
    });
    return;
  }

  if (!isJsonContentType(req.headers['content-type'])) {
    sendJson(res, 415, {
      ok: false,
      code: 'UNSUPPORTED_MEDIA_TYPE',
      error: 'Unsupported Content-Type. Use application/json.',
    });
    return;
  }

  let parsedBody: unknown;
  try {
    parsedBody = await parseJsonRequestBody(req);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      sendJson(res, 413, {
        ok: false,
        code: 'VALIDATION_ERROR',
        error: err.message,
      });
      return;
    }
    if (err instanceof MalformedJsonError) {
      sendJson(res, 400, {
        ok: false,
        code: 'VALIDATION_ERROR',
        error: err.message,
      });
      return;
    }
    sendJson(res, 400, {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: 'Unable to read request body.',
    });
    return;
  }

  try {
    const result = await processRfqSubmission(parsedBody);
    sendJson(res, result.httpStatus, result.body);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error.';
    sendJson(res, 500, {
      ok: false,
      code: 'INTERNAL_ERROR',
      error: `Failed to process RFQ submission: ${message}`,
    });
  }
}
