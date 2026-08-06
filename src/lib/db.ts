import { createClient, type Client } from '@libsql/client';

/**
 * Turso (libSQL) connection with a hot-reload-safe global cache.
 *
 * TURSO_DATABASE_URL is optional in local dev: without it the catalogue falls back to the
 * static seed (see lib/catalogue.ts) so the marketing site still renders. Lead capture,
 * admin and blog all require a real connection and surface a clear error instead.
 */

const globalForDb = globalThis as unknown as { _libsql?: Client };

// read lazily rather than at module load, so scripts that call dotenv after importing still work
const url = () => process.env.TURSO_DATABASE_URL;

export const hasDb = () => Boolean(url());

export function getDb(): Client {
  const dbUrl = url();
  if (!dbUrl) throw new Error('TURSO_DATABASE_URL is not set — database features are unavailable.');
  if (!globalForDb._libsql) {
    globalForDb._libsql = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  return globalForDb._libsql;
}

/** Run a query when a DB is configured; fall back to `fallback` when it isn't (or when it fails). */
export async function withDb<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasDb()) return fallback;
  try {
    return await run();
  } catch (err) {
    console.error('[db] query failed, using fallback:', (err as Error).message);
    return fallback;
  }
}
