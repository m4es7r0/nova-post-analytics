import "server-only";

import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";
import { env } from "@/shared/config/env";

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

const pool = new Pool({ connectionString: resolveDatabaseUrl() });

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      novaPostApiKey: {
        type: "string",
        required: false,
        input: false, // don't allow setting via signup
      },
    },
  },
});
