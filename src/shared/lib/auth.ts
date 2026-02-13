import "server-only";

import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
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
