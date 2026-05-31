import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { ensureAccountsSchema } from './schema.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Types ──

interface TokenPayload {
  acc_id: number;
  email: string;
  username: string;
  timestamp: number;
}

interface AccountRow {
  acc_id: number;
  username: string;
  email: string;
  pnumber: string | null;
  bio: string | null;
  avatar_seed: string | null;
  avatar_url: string | null;
  createdat: string;
}

interface PasswordRow {
  password: string;
}

// ── Helpers ──

const sql = neon(process.env.DATABASE_URL!);
const AUTH_SECRET = process.env.AUTH_SECRET;

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createToken(payload: TokenPayload): string {
  if (!AUTH_SECRET) {
    // Fallback (dev only): unsigned token
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('hex');
  return `${body}.${sig}`;
}

// ── Handler ──

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    await ensureAccountsSchema();

    // ── LOGIN ──
    if (method === 'POST' && query.action === 'login') {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const account = await sql`
        SELECT acc_id, username, email, pnumber, bio, avatar_seed, avatar_url, createdat
        FROM accounts
        WHERE email = ${email}
      ` as AccountRow[];

      if (account.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const storedPassword = await sql`
        SELECT password FROM accounts WHERE email = ${email}
      ` as PasswordRow[];

      const hashedInputPassword = hashPassword(password);
      if (storedPassword[0].password !== hashedInputPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = createToken({
        acc_id: account[0].acc_id,
        email: account[0].email,
        username: account[0].username,
        timestamp: Date.now()
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: account[0]
      });

    // ── REGISTER ──
    } else if (method === 'POST') {
      const { username, email, password, pnumber } = req.body as {
        username?: string;
        email?: string;
        password?: string;
        pnumber?: string;
      };

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const emailExists = await sql`
        SELECT acc_id FROM accounts WHERE email = ${email}
      `;

      if (emailExists.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      const usernameExists = await sql`
        SELECT acc_id FROM accounts WHERE username = ${username}
      `;

      if (usernameExists.length > 0) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const hashedPassword = hashPassword(password);
      const inserted = await sql`
        INSERT INTO accounts (username, email, password, pnumber)
        VALUES (${username}, ${email}, ${hashedPassword}, ${pnumber || null})
        RETURNING acc_id, username, email, pnumber, createdat
      `;

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: inserted[0]
      });

    // ── GET ALL ACCOUNTS ──
    } else if (method === 'GET') {
      const accounts = await sql`
        SELECT acc_id, username, email, pnumber, createdat
        FROM accounts
      `;

      res.status(200).json(accounts);

    // ── UPDATE ACCOUNT ──
    } else if (method === 'PUT') {
      const { id, username, email, pnumber, bio, avatar_seed, avatar_url } = req.body as {
        id?: number;
        username?: string;
        email?: string;
        pnumber?: string;
        bio?: string;
        avatar_seed?: string | null;
        avatar_url?: string | null;
      };

      if (!id) {
        return res.status(400).json({ error: 'Account ID required' });
      }

      // Logic for exclusive avatars:
      // If avatar_seed is provided and not null, we want to use it and clear url.
      // If avatar_url is provided and not null, we want to use it and clear seed.
      let finalSeed: string | null | undefined = avatar_seed;
      let finalUrl: string | null | undefined = avatar_url;

      if (avatar_seed !== undefined && avatar_seed !== null) {
        finalUrl = null;
      } else if (avatar_url !== undefined && avatar_url !== null) {
        finalSeed = null;
      }

      const updated = await sql`
        UPDATE accounts
        SET username = COALESCE(${username ?? null}, username),
            email = COALESCE(${email ?? null}, email),
            pnumber = COALESCE(${pnumber ?? null}, pnumber),
            bio = COALESCE(${bio ?? null}, bio),
            avatar_seed = ${finalSeed === undefined ? sql`avatar_seed` : finalSeed},
            avatar_url = ${finalUrl === undefined ? sql`avatar_url` : finalUrl}
        WHERE acc_id = ${id}
        RETURNING acc_id, username, email, pnumber, bio, avatar_seed, avatar_url, createdat
      ` as AccountRow[];

      if (updated.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Account updated successfully',
        data: updated[0]
      });

    // ── DELETE ACCOUNT ──
    } else if (method === 'DELETE') {
      const { id } = req.body as { id?: number };

      if (!id) {
        return res.status(400).json({ error: 'Account ID required' });
      }

      // Verify the account exists first
      const accountCheck = await sql`SELECT acc_id FROM accounts WHERE acc_id = ${id}`;
      if (accountCheck.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Cascade-delete all child records in dependency order.
      // Each step is wrapped in try-catch since tables may not exist yet.
      const tryDel = async (q: Promise<unknown>): Promise<void> => { try { await q; } catch { /* table may not exist */ } };

      // 1. goal_contributions (references goals)
      await tryDel(sql`
        DELETE FROM goal_contributions
        WHERE goal_id IN (SELECT goal_id FROM goals WHERE account_id = ${id})
      `);

      // 2. goals (references accounts)
      await tryDel(sql`DELETE FROM goals WHERE account_id = ${id}`);

      // 3. transactions (references accounts & wallets)
      await tryDel(sql`DELETE FROM transactions WHERE account_id = ${id}`);

      // 4. wallets (references accounts)
      await tryDel(sql`DELETE FROM wallets WHERE account_id = ${id}`);

      // 5. password_resets (references accounts)
      await tryDel(sql`DELETE FROM password_resets WHERE account_id = ${id}`);

      // 6. Finally delete the account itself
      await sql`
        DELETE FROM accounts WHERE acc_id = ${id}
        RETURNING acc_id
      `;

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: unknown) {
    console.error('Account error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}
