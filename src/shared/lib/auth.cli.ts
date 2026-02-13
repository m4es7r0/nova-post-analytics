import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

/**
 * CLI-only Better Auth config for migrations.
 * Keep this file free of `server-only` imports so `@better-auth/cli` can load it.
 */
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_URL,
});

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      novaPostApiKey: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
});
