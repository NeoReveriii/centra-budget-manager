import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { sendPasswordResetEmail } from './mailer.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AccountRow {
  acc_id: number;
  username: string;
  email: string;
}

interface ResetTokenRow {
  id: number;
  userId: number;
  email: string;
  username: string;
}

interface VerifyTokenRow {
  email: string;
  username: string;
}

interface ColumnMetaRow {
  data_type: string;
}

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(dbUrl);
}

async function ensurePasswordResetTokensSchema(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS "PasswordResetTokens" (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES accounts(acc_id) ON DELETE CASCADE,
      "tokenHash" TEXT NOT NULL UNIQUE,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_prt_user_id ON "PasswordResetTokens"("userId")`;
  await sql`CREATE INDEX IF NOT EXISTS idx_prt_expires_at ON "PasswordResetTokens"("expiresAt")`;

  const expiresAtMeta = await sql`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PasswordResetTokens'
      AND column_name = 'expiresAt'
    LIMIT 1
  ` as ColumnMetaRow[];

  if (expiresAtMeta[0]?.data_type === 'date') {
    await sql`
      ALTER TABLE "PasswordResetTokens"
      ALTER COLUMN "expiresAt"
      TYPE TIMESTAMPTZ
      USING ("expiresAt"::timestamptz + INTERVAL '1 day' - INTERVAL '1 second')
    `;
  }
}

async function parseRequestBody(req: VercelRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }

  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function handleForgotPassword(req: VercelRequest, res: VercelResponse): Promise<void> {
  const body = await parseRequestBody(req);
  const email = String(body?.email || '').trim();

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    const sql = getSql();
    await ensurePasswordResetTokensSchema();

    const accounts = await sql`
      SELECT acc_id, username, email
      FROM accounts
      WHERE LOWER(email) = LOWER(${email})
    ` as AccountRow[];

    if (accounts.length === 0) {
      res.status(200).json({
        message: 'If an account exists, a password reset link has been sent to your email'
      });
      return;
    }

    const user = accounts[0];
    const resetToken = generateResetToken();
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql`DELETE FROM "PasswordResetTokens" WHERE "userId" = ${user.acc_id}`;
    await sql`
      INSERT INTO "PasswordResetTokens" ("userId", "tokenHash", "expiresAt")
      VALUES (${user.acc_id}, ${tokenHash}, ${expiresAt})
    `;

    const requestOrigin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : null);
    const delivery = await sendPasswordResetEmail(user.email, resetToken, user.username, requestOrigin);

    res.status(200).json({
      message: 'If an account exists, a password reset link has been sent to your email',
      delivery: {
        acceptedCount: Array.isArray(delivery?.accepted) ? delivery.accepted.length : 0,
        messageId: delivery?.messageId || null
      }
    });
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Forgot password request failed',
      details: message
    });
  }
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse): Promise<void> {
  const body = await parseRequestBody(req);
  const token = String(body?.token || '').trim();
  const newPassword = String(body?.newPassword || '');
  const confirmPassword = String(body?.confirmPassword || '');

  if (!token || !newPassword || !confirmPassword) {
    res.status(400).json({ error: 'Token and passwords are required' });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  try {
    const sql = getSql();
    await ensurePasswordResetTokensSchema();

    const tokenHash = hashToken(token);

    const records = await sql`
      SELECT t.id, t."userId", a.email, a.username
      FROM "PasswordResetTokens" t
      JOIN accounts a ON t."userId" = a.acc_id
      WHERE t."tokenHash" = ${tokenHash}
        AND t."expiresAt" > NOW()
      LIMIT 1
    ` as ResetTokenRow[];

    if (records.length === 0) {
      res.status(400).json({
        error: 'Invalid or expired reset link. Please request a new one.'
      });
      return;
    }

    const { id: resetId, userId: accountId } = records[0];
    const hashedPassword = hashPassword(newPassword);

    const updated = await sql`
      UPDATE accounts
      SET password = ${hashedPassword}
      WHERE acc_id = ${accountId}
      RETURNING acc_id
    `;

    if (updated.length === 0) {
      res.status(500).json({ error: 'Password update failed: account not found' });
      return;
    }

    await sql`DELETE FROM "PasswordResetTokens" WHERE id = ${resetId}`;

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Reset password request failed',
      details: message
    });
  }
}

async function handleVerifyToken(req: VercelRequest, res: VercelResponse): Promise<void> {
  const token = req.query.token;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  try {
    const sql = getSql();
    await ensurePasswordResetTokensSchema();

    const tokenHash = hashToken(token);

    const records = await sql`
      SELECT a.email, a.username
      FROM "PasswordResetTokens" t
      JOIN accounts a ON t."userId" = a.acc_id
      WHERE t."tokenHash" = ${tokenHash}
        AND t."expiresAt" > NOW()
      LIMIT 1
    ` as VerifyTokenRow[];

    if (records.length === 0) {
      res.status(400).json({ valid: false });
      return;
    }

    res.status(200).json({
      valid: true,
      email: records[0].email,
      username: records[0].username
    });
  } catch (error: unknown) {
    console.error('Token verification error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Token verification failed',
      details: message
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Server is missing DATABASE_URL configuration' });
    }

    if (method === 'POST' && query.action === 'forgot') {
      return handleForgotPassword(req, res);
    } else if (method === 'POST' && query.action === 'reset') {
      return handleResetPassword(req, res);
    } else if (method === 'GET' && query.action === 'verify') {
      return handleVerifyToken(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('Reset API unhandled error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
