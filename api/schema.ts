import { neon } from '@neondatabase/serverless';

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(dbUrl);
}

export async function ensureAccountsSchema(): Promise<void> {
  const sql = getSql();

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
      createdat DATE DEFAULT NOW()
    )
  `;

  const checkCol = async (colName: string): Promise<boolean> => {
    const res = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'accounts' AND column_name = ${colName}
      ) AS exists
    `;
    return res[0].exists;
  };

  if (!(await checkCol('bio'))) {
    await sql`ALTER TABLE accounts ADD COLUMN bio TEXT`;
  }
  if (!(await checkCol('avatar_seed'))) {
    await sql`ALTER TABLE accounts ADD COLUMN avatar_seed TEXT`;
  }
  if (!(await checkCol('avatar_url'))) {
    await sql`ALTER TABLE accounts ADD COLUMN avatar_url TEXT`;
  }
  if (!(await checkCol('neon_auth_id'))) {
    await sql`ALTER TABLE accounts ADD COLUMN neon_auth_id TEXT UNIQUE`;
  }
}
