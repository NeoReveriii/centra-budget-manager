import { createHmac } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from './http-types.js';

interface RateLimitRow {
  request_count: number | string;
  reset_at: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

interface ConsumeRateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

let schemaPromise: Promise<void> | null = null;
let lastCleanupAt = 0;

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not configured');
  return neon(databaseUrl);
}

async function ensureRateLimitSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS api_rate_limits (
          rate_key TEXT NOT NULL,
          window_start TIMESTAMPTZ NOT NULL,
          reset_at TIMESTAMPTZ NOT NULL,
          request_count INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (rate_key, window_start)
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS api_rate_limits_reset_at_idx
        ON api_rate_limits (reset_at)
      `;
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
}

async function cleanupExpiredRows(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupAt < 10 * 60 * 1000) return;
  lastCleanupAt = now;

  const sql = getSql();
  await sql`
    DELETE FROM api_rate_limits
    WHERE reset_at < NOW() - INTERVAL '1 day'
  `.catch((error: unknown) => {
    console.error('Rate-limit cleanup failed:', error instanceof Error ? error.message : String(error));
  });
}

export async function consumeRateLimit({
  key,
  limit,
  windowSeconds,
}: ConsumeRateLimitOptions): Promise<RateLimitResult> {
  await ensureRateLimitSchema();
  void cleanupExpiredRows();

  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindowSeconds = Math.max(1, Math.floor(windowSeconds));
  const now = Date.now();
  const windowMs = safeWindowSeconds * 1000;
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const resetAt = new Date(windowStart.getTime() + windowMs);
  const sql = getSql();

  const rows = await sql`
    INSERT INTO api_rate_limits (rate_key, window_start, reset_at, request_count)
    VALUES (${key}, ${windowStart.toISOString()}, ${resetAt.toISOString()}, 1)
    ON CONFLICT (rate_key, window_start)
    DO UPDATE SET
      request_count = api_rate_limits.request_count + 1,
      reset_at = EXCLUDED.reset_at
    RETURNING request_count, reset_at
  ` as RateLimitRow[];

  const count = Number(rows[0]?.request_count ?? safeLimit + 1);
  const storedResetAt = new Date(rows[0]?.reset_at ?? resetAt);

  return {
    allowed: count <= safeLimit,
    limit: safeLimit,
    remaining: Math.max(0, safeLimit - count),
    resetAt: storedResetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((storedResetAt.getTime() - now) / 1000)),
  };
}

export function setRateLimitHeaders(
  res: VercelResponse,
  result: RateLimitResult,
  prefix = 'RateLimit',
): void {
  res.setHeader(`${prefix}-Limit`, String(result.limit));
  res.setHeader(`${prefix}-Remaining`, String(result.remaining));
  res.setHeader(`${prefix}-Reset`, String(Math.ceil(result.resetAt.getTime() / 1000)));
}

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (value) return value.split(',')[0]?.trim() || 'unknown';

  const realIp = req.headers?.['x-real-ip'];
  return (Array.isArray(realIp) ? realIp[0] : realIp)?.trim() || 'unknown';
}

export function privateRateLimitKey(scope: string, value: string): string {
  const secret = process.env.RATE_LIMIT_HASH_SALT || process.env.DATABASE_URL;
  if (!secret) throw new Error('RATE_LIMIT_HASH_SALT or DATABASE_URL must be configured');
  const digest = createHmac('sha256', secret).update(value).digest('hex');
  return `${scope}:${digest}`;
}

export function envPositiveInteger(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
