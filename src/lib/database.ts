import { Pool } from "pg";

type GlobalWithNovexaPool = typeof globalThis & { novexaApplicationPool?: Pool };
const globalForDatabase = globalThis as GlobalWithNovexaPool;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL n'est pas configurée.");
  if (!globalForDatabase.novexaApplicationPool) {
    globalForDatabase.novexaApplicationPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }
  return globalForDatabase.novexaApplicationPool;
}
