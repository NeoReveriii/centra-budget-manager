import { neon } from '@neondatabase/serverless';
import { ensureAccountsSchema } from './schema.js';
import { requireAccount, requireAccountProfile } from './auth-helper.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    await ensureAccountsSchema();

    if (method === 'GET') {
      const profile = await requireAccountProfile(req, res);
      if (!profile) return;
      return res.status(200).json(profile);

    } else if (method === 'PUT') {
      const account = await requireAccount(req, res);
      if (!account) return;

      const { id, username, email, pnumber, bio, avatar_seed, avatar_url } = req.body as {
        id?: number;
        username?: string;
        email?: string;
        pnumber?: string;
        bio?: string;
        avatar_seed?: string | null;
        avatar_url?: string | null;
      };

      const targetId = id ?? account.acc_id;
      if (targetId !== account.acc_id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

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
        WHERE acc_id = ${account.acc_id}
        RETURNING acc_id, username, email, pnumber, bio, avatar_seed, avatar_url, createdat
      ` as AccountRow[];

      if (updated.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Account updated successfully',
        data: updated[0]
      });

    } else if (method === 'DELETE') {
      const account = await requireAccount(req, res);
      if (!account) return;

      const { id } = req.body as { id?: number };
      const targetId = id ?? account.acc_id;
      if (targetId !== account.acc_id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const accountCheck = await sql`SELECT acc_id FROM accounts WHERE acc_id = ${account.acc_id}`;
      if (accountCheck.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const tryDel = async (q: Promise<unknown>): Promise<void> => {
        try { await q; } catch { /* table may not exist */ }
      };

      await tryDel(sql`
        DELETE FROM goal_contributions
        WHERE goal_id IN (SELECT goal_id FROM goals WHERE account_id = ${account.acc_id})
      `);
      await tryDel(sql`DELETE FROM goals WHERE account_id = ${account.acc_id}`);
      await tryDel(sql`DELETE FROM transactions WHERE account_id = ${account.acc_id}`);
      await tryDel(sql`DELETE FROM wallets WHERE account_id = ${account.acc_id}`);

      await sql`
        DELETE FROM accounts WHERE acc_id = ${account.acc_id}
        RETURNING acc_id
      `;

      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: unknown) {
    console.error('Account error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
}
