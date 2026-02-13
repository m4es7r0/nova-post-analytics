import "server-only";

import Database from "better-sqlite3";

export const sqlite = new Database("sqlite.db");
