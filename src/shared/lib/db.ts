import "server-only";

import { Pool } from "@neondatabase/serverless";

function resolveDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_URL;

  if (!url) {
    throw new Error(
      "Missing database URL. Expected one of: DATABASE_URL, POSTGRES_URL, STORAGE_URL"
    );
  }
  return url;
}

/**
 * Neon Serverless Postgres connection pool.
 * Uses DATABASE_URL env var (provided by Vercel Neon integration).
 *
 * For local development, point DATABASE_URL to your Neon project's
 * connection string (available in the Neon dashboard).
 */
export const pool = new Pool({
  connectionString: resolveDatabaseUrl(),
});
