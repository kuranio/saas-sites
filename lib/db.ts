import { Pool } from "pg";

const globalPool = globalThis as typeof globalThis & { _pgPool?: Pool };

if (!globalPool._pgPool) {
  globalPool._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
    max: 5,
  });
}

export const pool = globalPool._pgPool;

export async function queryOne<T>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await pool.query(sql, params);
  return (result.rows[0] as T) ?? null;
}
