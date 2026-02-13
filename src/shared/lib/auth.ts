import "server-only";

import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

const sqlite = new Database("sqlite.db");

export const auth = betterAuth({
  database: sqlite,
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
