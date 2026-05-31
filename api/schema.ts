import { neon } from '@neondatabase/serverless';

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(dbUrl);
}

export async function ensurePasswordResetSchema(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      reset_id SERIAL PRIMARY KEY,
      account_id INTEGER NOT NULL REFERENCES accounts(acc_id) ON DELETE CASCADE,
      reset_token TEXT NOT NULL UNIQUE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_address TEXT,
      user_agent TEXT
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_account_id ON password_resets(account_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at)`;
}

export async function ensureAccountsSchema(): Promise<void> {
  const sql = getSql();

  // 1. Create table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      acc_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      pnumber TEXT,
      bio TEXT,
      avatar_seed TEXT,
      avatar_url TEXT,
      createdat DATE DEFAULT NOW(),
      last_password_reset_at TIMESTAMPTZ,
      password_reset_attempts INT DEFAULT 0,
      password_reset_locked_until TIMESTAMPTZ
    )
  `;

  // 2. Helper to check if a column exists
  const checkCol = async (colName: string): Promise<boolean> => {
    const res = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'accounts' AND column_name = ${colName}
      ) AS exists
    `;
    return res[0].exists;
  };

  // 3. Incrementally apply column updates for migration support
  if (!(await checkCol('last_password_reset_at'))) {
    await sql`ALTER TABLE accounts ADD COLUMN last_password_reset_at TIMESTAMPTZ`;
  }
  if (!(await checkCol('password_reset_attempts'))) {
    await sql`ALTER TABLE accounts ADD COLUMN password_reset_attempts INT DEFAULT 0`;
  }
  if (!(await checkCol('password_reset_locked_until'))) {
    await sql`ALTER TABLE accounts ADD COLUMN password_reset_locked_until TIMESTAMPTZ`;
  }
  if (!(await checkCol('bio'))) {
    await sql`ALTER TABLE accounts ADD COLUMN bio TEXT`;
  }
  if (!(await checkCol('avatar_seed'))) {
    await sql`ALTER TABLE accounts ADD COLUMN avatar_seed TEXT`;
  }
  if (!(await checkCol('avatar_url'))) {
    await sql`ALTER TABLE accounts ADD COLUMN avatar_url TEXT`;
  }
}
