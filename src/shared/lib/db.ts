import "server-only";

import { Pool } from "@neondatabase/serverless";

/**
 * Neon Serverless Postgres connection pool.
 * Uses DATABASE_URL env var (provided by Vercel Neon integration).
 *
 * For local development, point DATABASE_URL to your Neon project's
 * connection string (available in the Neon dashboard).
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
