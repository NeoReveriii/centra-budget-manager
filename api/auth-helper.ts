import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureAccountsSchema } from './schema.js';

export interface AccountContext {
  acc_id: number;
}

export interface AccountProfile {
  acc_id: number;
  username: string;
  email: string;
  pnumber: string | null;
  bio: string | null;
  avatar_seed: string | null;
  avatar_url: string | null;
  createdat: string;
}

interface AccountRow extends AccountProfile {
  neon_auth_id: string | null;
}

interface NeonJwtPayload {
  sub?: string;
  email?: string;
  name?: string;
}

interface NeonAuthUserRow {
  email: string;
  name: string | null;
}

const sql = neon(process.env.DATABASE_URL!);
const NEON_AUTH_MANAGED_PASSWORD = '__neon_auth__';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  const jwksUrl = process.env.NEON_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('NEON_JWKS_URL is not configured');
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(jwksUrl));
  }
  return jwks;
}

function getIssuer(): string {
  const issuer = process.env.NEON_AUTH_ISSUER || process.env.VITE_NEON_AUTH_URL;
  if (issuer) {
    return issuer;
  }

  const jwksUrl = process.env.NEON_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('NEON_AUTH_ISSUER or NEON_JWKS_URL is not configured');
  }
  return new URL(jwksUrl).origin;
}

function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

async function verifyNeonToken(token: string): Promise<NeonJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: getIssuer(),
    });
    return payload as NeonJwtPayload;
  } catch (error) {
    console.error('Neon JWT verification failed:', error);
    return null;
  }
}

async function pickUniqueUsername(baseUsername: string): Promise<string> {
  const sanitized = baseUsername.trim().replace(/\s+/g, '_').slice(0, 50) || 'user';
  let candidate = sanitized;

  for (let i = 0; i < 20; i++) {
    const existing = await sql`
      SELECT acc_id FROM accounts WHERE username = ${candidate} LIMIT 1
    `;
    if (existing.length === 0) return candidate;
    candidate = `${sanitized}_${i + 1}`.slice(0, 50);
  }

  return `${sanitized}_${Date.now()}`.slice(0, 50);
}

async function resolveNeonAuthIdentity(payload: NeonJwtPayload): Promise<{ neonAuthId: string; email: string; name?: string } | null> {
  const neonAuthId = payload.sub?.trim();
  if (!neonAuthId) return null;

  let email = payload.email?.trim();
  let name = payload.name?.trim();

  if (!email) {
    try {
      const rows = await sql`
        SELECT email, name
        FROM neon_auth."user"
        WHERE id = ${neonAuthId}
        LIMIT 1
      ` as NeonAuthUserRow[];
      if (rows.length > 0) {
        email = rows[0].email?.trim();
        name = name || rows[0].name?.trim() || undefined;
      }
    } catch {
      // neon_auth schema may be unavailable in some environments
    }
  }

  if (!email) return null;
  return { neonAuthId, email, name };
}

export async function resolveLocalAccount(payload: NeonJwtPayload): Promise<AccountProfile | null> {
  const identity = await resolveNeonAuthIdentity(payload);
  if (!identity) {
    return null;
  }

  const { neonAuthId, email, name } = identity;

  await ensureAccountsSchema();

  const byNeonId = await sql`
    SELECT acc_id, username, email, pnumber, bio, avatar_seed, avatar_url, createdat, neon_auth_id
    FROM accounts
    WHERE neon_auth_id = ${neonAuthId}
    LIMIT 1
  ` as AccountRow[];

  if (byNeonId.length > 0) {
    const { neon_auth_id: _neonAuthId, ...profile } = byNeonId[0];
    return profile;
  }

  const byEmail = await sql`
    SELECT acc_id, username, email, pnumber, bio, avatar_seed, avatar_url, createdat, neon_auth_id
    FROM accounts
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  ` as AccountRow[];

  if (byEmail.length > 0) {
    const updated = await sql`
      UPDATE accounts
      SET neon_auth_id = ${neonAuthId}
      WHERE acc_id = ${byEmail[0].acc_id}
      RETURNING acc_id, username, email, pnumber, bio, avatar_seed, avatar_url, createdat, neon_auth_id
    ` as AccountRow[];
    const { neon_auth_id: _neonAuthId, ...profile } = updated[0];
    return profile;
  }

  const username = await pickUniqueUsername(name || email.split('@')[0] || 'user');
  const inserted = await sql`
    INSERT INTO accounts (username, email, password, neon_auth_id)
    VALUES (${username}, ${email}, ${NEON_AUTH_MANAGED_PASSWORD}, ${neonAuthId})
    RETURNING acc_id, username, email, pnumber, bio, avatar_seed, avatar_url, createdat, neon_auth_id
  ` as AccountRow[];

  const { neon_auth_id: _neonAuthId, ...profile } = inserted[0];
  return profile;
}

export async function requireAccount(
  req: VercelRequest,
  res: VercelResponse
): Promise<AccountContext | null> {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const payload = await verifyNeonToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const profile = await resolveLocalAccount(payload);
  if (!profile) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return { acc_id: profile.acc_id };
}

export async function requireAccountProfile(
  req: VercelRequest,
  res: VercelResponse
): Promise<AccountProfile | null> {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const payload = await verifyNeonToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const profile = await resolveLocalAccount(payload);
  if (!profile) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return profile;
}
