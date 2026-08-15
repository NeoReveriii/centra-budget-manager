import { neon } from '@neondatabase/serverless';
import { requireAccount } from './auth-helper.js';
import {
  createGoalSchema,
  deleteGoalSchema,
  updateGoalSchema,
} from './schemas.js';
import { parseBody } from './validate.js';
import type { VercelRequest, VercelResponse } from './http-types.js';

interface ColumnRow {
  column_name: string;
}

interface RegClassRow {
  reg: string | null;
}

const sql = neon(process.env.DATABASE_URL!);
let goalsSchemaRecoveryPromise: Promise<void> | null = null;

async function ensureGoalsSchema(): Promise<void> {
  const reg = await sql`SELECT to_regclass('public.goals') AS reg` as RegClassRow[];
  const exists = Boolean(reg?.[0]?.reg);

  if (!exists) {
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        goal_id SERIAL PRIMARY KEY,
        account_id INTEGER NOT NULL REFERENCES accounts(acc_id),
        title TEXT NOT NULL,
        category TEXT,
        priority INTEGER DEFAULT 1,
        target_amount NUMERIC(12,2) NOT NULL,
        current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        deadline DATE,
        status TEXT DEFAULT 'Active',
        allow_expense BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  } else {
    const cols = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'goals'
    ` as ColumnRow[];
    const colNames = cols.map(c => c.column_name);

    if (!colNames.includes('category')) {
      await sql`ALTER TABLE goals ADD COLUMN category TEXT`;
    }
    if (!colNames.includes('priority')) {
      await sql`ALTER TABLE goals ADD COLUMN priority INTEGER DEFAULT 1`;
    }
    if (!colNames.includes('status')) {
      await sql`ALTER TABLE goals ADD COLUMN status TEXT DEFAULT 'Active'`;
    }
    if (!colNames.includes('allow_expense')) {
      await sql`ALTER TABLE goals ADD COLUMN allow_expense BOOLEAN NOT NULL DEFAULT FALSE`;
    }
  }

  await sql`
    CREATE TABLE IF NOT EXISTS goal_contributions (
      contribution_id SERIAL PRIMARY KEY,
      goal_id INTEGER NOT NULL REFERENCES goals(goal_id) ON DELETE CASCADE,
      amount NUMERIC(12,2) NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_goals_account_created ON goals(account_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_created ON goal_contributions(goal_id, created_at DESC)`;
}

function isMissingGoalsSchemaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = String((error as { code?: unknown }).code || '');
  return code === '42P01' || code === '42703';
}

async function recoverGoalsSchema(): Promise<void> {
  if (!goalsSchemaRecoveryPromise) {
    goalsSchemaRecoveryPromise = ensureGoalsSchema().catch((error) => {
      goalsSchemaRecoveryPromise = null;
      throw error;
    });
  }
  await goalsSchemaRecoveryPromise;
}

async function withGoalsSchemaRecovery<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isMissingGoalsSchemaError(error)) throw error;
    await recoverGoalsSchema();
    return operation();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;

    if (req.method === 'GET') {
      const rows = await withGoalsSchemaRecovery(() => sql`
        SELECT
          g.goal_id,
          g.title,
          g.category,
          g.priority,
          g.target_amount,
          g.current_amount,
          g.deadline,
          g.status,
          g.allow_expense,
          g.created_at,
          NULL::json AS history
        FROM goals g
        WHERE g.account_id = ${account.acc_id}
        ORDER BY g.created_at DESC
      `);
      return res.status(200).json({ goals: rows });
    }

    if (req.method === 'POST') {
      const body = parseBody(createGoalSchema, req.body, res);
      if (!body) return;

      const { title, target_amount, deadline, category, priority, allow_expense } = body;

      if (deadline) {
        const selectedDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          return res.status(400).json({ error: 'Please select a valid future date.' });
        }
      }

      const allowExpenseBool = allow_expense === true || allow_expense === 'true';
      const rows = await withGoalsSchemaRecovery(() => sql`
        INSERT INTO goals (account_id, title, target_amount, deadline, category, priority, allow_expense)
        VALUES (${account.acc_id}, ${title}, ${target_amount}, ${deadline || null}, ${category || 'Savings'}, ${priority || 1}, ${allowExpenseBool})
        RETURNING *
      `);

      return res.status(201).json({ goal: rows[0] });
    }

    if (req.method === 'PUT') {
      const body = parseBody(updateGoalSchema, req.body, res);
      if (!body) return;

      const { goal_id, add_amount, note, title, target_amount, deadline, category, priority } = body;

      if (add_amount === undefined && deadline) {
        const selectedDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          return res.status(400).json({ error: 'Please select a valid future date.' });
        }
      }

      const rows = add_amount !== undefined
        ? await withGoalsSchemaRecovery(() => sql`
            WITH updated_goal AS (
              UPDATE goals
              SET current_amount = current_amount + ${add_amount}
              WHERE goal_id = ${goal_id} AND account_id = ${account.acc_id}
              RETURNING *
            ), recorded_contribution AS (
              INSERT INTO goal_contributions (goal_id, amount, note)
              SELECT goal_id, ${add_amount}, ${note || 'Manual add'}
              FROM updated_goal
              RETURNING goal_id
            )
            SELECT updated_goal.*
            FROM updated_goal
            JOIN recorded_contribution USING (goal_id)
          `)
        : await withGoalsSchemaRecovery(() => sql`
            UPDATE goals
            SET title = COALESCE(${title ?? null}, title),
                target_amount = COALESCE(${target_amount ?? null}, target_amount),
                deadline = CASE WHEN ${deadline !== undefined} THEN ${deadline ?? null} ELSE deadline END,
                category = COALESCE(${category ?? null}, category),
                priority = COALESCE(${priority ?? null}, priority)
            WHERE goal_id = ${goal_id} AND account_id = ${account.acc_id}
            RETURNING *
          `);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found or access denied.' });
      }

      return res.status(200).json({ goal: rows[0] });
    }

    if (req.method === 'DELETE') {
      const body = parseBody(deleteGoalSchema, req.body, res);
      if (!body) return;

      const { goal_id } = body;

      const rows = await withGoalsSchemaRecovery(() => sql`
        DELETE FROM goals
        WHERE goal_id = ${goal_id} AND account_id = ${account.acc_id}
        RETURNING goal_id
      `);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found or access denied.' });
      }

      return res.status(200).json({ success: true, deleted_goal_id: goal_id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Goals API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
