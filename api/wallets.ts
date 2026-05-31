import { neon } from '@neondatabase/serverless';
import { requireAccount } from './auth-helper.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RegClassRow {
  reg: string | null;
}

interface CountRow {
  count: string;
}

interface WalletNameRow {
  name: string;
}

const sql = neon(process.env.DATABASE_URL!);
const SCHEMA_CACHE_TTL_MS = 5 * 60 * 1000;

let walletsSchemaValidatedAt = 0;
let walletsSchemaValidationPromise: Promise<void> | null = null;

async function ensureWalletsSchema(): Promise<void> {
  const reg = await sql`SELECT to_regclass('public.wallets') AS reg` as RegClassRow[];
  const exists = Boolean(reg?.[0]?.reg);

  if (!exists) {
    await sql`
      CREATE TABLE IF NOT EXISTS wallets (
        wallet_id SERIAL PRIMARY KEY,
        account_id INTEGER NOT NULL REFERENCES accounts(acc_id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        initial_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  }
}

async function ensureTransactionTransferColumns(): Promise<void> {
  const reg = await sql`SELECT to_regclass('public.transactions') AS reg` as RegClassRow[];
  const exists = Boolean(reg?.[0]?.reg);
  if (!exists) return;

  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transfer_from_wallet_id INTEGER REFERENCES wallets(wallet_id)`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transfer_to_wallet_id INTEGER REFERENCES wallets(wallet_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_transfer_from_wallet_id ON transactions(transfer_from_wallet_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_transfer_to_wallet_id ON transactions(transfer_to_wallet_id)`;
}

async function ensureWalletSchemasCached(): Promise<void> {
  const now = Date.now();
  if (now - walletsSchemaValidatedAt < SCHEMA_CACHE_TTL_MS) return;

  if (!walletsSchemaValidationPromise) {
    walletsSchemaValidationPromise = (async () => {
      await ensureWalletsSchema();
      await ensureTransactionTransferColumns();
      walletsSchemaValidatedAt = Date.now();
    })();
  }

  try {
    await walletsSchemaValidationPromise;
  } finally {
    walletsSchemaValidationPromise = null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;

    await ensureWalletSchemasCached();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT
          w.wallet_id,
          w.name,
          w.type,
          w.initial_balance,
          w.status,
          w.created_at,
          (
            w.initial_balance +
            COALESCE(SUM(CASE
              WHEN t.type = 'Income' AND t.wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer' AND t.transfer_to_wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer'
                AND t.transfer_to_wallet_id IS NULL
                AND t.wallet_id = w.wallet_id
                AND (t.description ILIKE 'Transfer from%' OR t.description ILIKE 'Transfer In from%')
              THEN t.amount
              ELSE 0 END), 0) -
            COALESCE(SUM(CASE
              WHEN t.type = 'Expense' AND t.wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer' AND t.transfer_from_wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer'
                AND t.transfer_from_wallet_id IS NULL
                AND t.wallet_id = w.wallet_id
                AND (t.description ILIKE 'Transfer to%' OR t.description ILIKE 'Transfer Out to%')
              THEN t.amount
              ELSE 0 END), 0)
          ) as calculated_balance
        FROM wallets w
        LEFT JOIN transactions t
          ON t.account_id = w.account_id
        WHERE w.account_id = ${account.acc_id}
        GROUP BY w.wallet_id
        ORDER BY w.created_at ASC
      `;
      return res.status(200).json({ wallets: rows });
    }

    if (req.method === 'POST') {
      const { name, type, initial_balance } = req.body as {
        name?: string;
        type?: string;
        initial_balance?: number | string;
      };
      const parsedBalance = parseFloat(String(initial_balance)) || 0;

      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      const rows = await sql`
        INSERT INTO wallets (account_id, name, type, initial_balance)
        VALUES (${account.acc_id}, ${name}, ${type}, ${parsedBalance})
        RETURNING *
      `;
      return res.status(201).json({ message: 'Wallet created', wallet: rows[0] });
    }

    if (req.method === 'PUT') {
      const { wallet_id, name, type, status, initial_balance } = req.body as {
        wallet_id?: number;
        name?: string;
        type?: string;
        status?: string;
        initial_balance?: number | string;
      };

      if (!wallet_id || !name || !type) {
        return res.status(400).json({ error: 'wallet_id, name, and type are required' });
      }

      const oldWalletRows = await sql`
        SELECT name FROM wallets WHERE wallet_id = ${wallet_id} AND account_id = ${account.acc_id}
      ` as WalletNameRow[];

      if (oldWalletRows.length === 0) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      const oldName = oldWalletRows[0].name;

      const parsedBalance = parseFloat(String(initial_balance)) || 0;

      const rows = await sql`
        UPDATE wallets
        SET name = ${name}, type = ${type}, status = ${status || 'ACTIVE'}, initial_balance = ${parsedBalance}
        WHERE wallet_id = ${wallet_id} AND account_id = ${account.acc_id}
        RETURNING *
      `;

      if (oldName !== name) {
        await sql`
          UPDATE transactions
          SET wallet_type = ${name}
          WHERE wallet_type = ${oldName} AND account_id = ${account.acc_id}
        `;
      }

      return res.status(200).json({ message: 'Wallet updated', wallet: rows[0] });
    }

    if (req.method === 'DELETE') {
      const { wallet_id } = req.body as { wallet_id?: number };
      if (!wallet_id) {
        return res.status(400).json({ error: 'wallet_id is required' });
      }

      const walletRows = await sql`
        SELECT name FROM wallets WHERE wallet_id = ${wallet_id} AND account_id = ${account.acc_id}
      ` as WalletNameRow[];

      if (walletRows.length === 0) return res.status(404).json({ error: 'Wallet not found' });
      const walletName = walletRows[0].name;

      const transCheck = await sql`
        SELECT COUNT(*) as count FROM transactions
        WHERE account_id = ${account.acc_id}
          AND (
            wallet_id = ${wallet_id}
            OR transfer_from_wallet_id = ${wallet_id}
            OR transfer_to_wallet_id = ${wallet_id}
            OR (wallet_id IS NULL AND wallet_type = ${walletName})
          )
      ` as CountRow[];

      if (parseInt(transCheck[0].count) > 0) {
        return res.status(400).json({ error: 'Cannot delete a wallet that has transactions. Delete or reassign the transactions first.' });
      }

      await sql`
        DELETE FROM wallets
        WHERE wallet_id = ${wallet_id} AND account_id = ${account.acc_id}
      `;
      return res.status(200).json({ message: 'Wallet deleted' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Wallets API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
