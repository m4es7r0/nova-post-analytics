import "server-only";

import { getSession } from "./auth-guard";

/**
 * Get the Nova Post API key for the current user.
 * Returns the user's personal key or null if not set.
 * Each user MUST configure their own key.
 */
export async function getApiKey(): Promise<string | null> {
  const session = await getSession();

  const userKey = (session?.user as { novaPostApiKey?: string | null })
    ?.novaPostApiKey;

  return userKey || null;
}

/**
 * Get the Nova Post API key, throwing if not available.
 * Use in pages that are guaranteed to be behind the API key guard.
 */
export async function requireApiKey(): Promise<string> {
  const key = await getApiKey();
  if (!key) {
    throw new Error("Nova Post API key not configured");
  }
  return key;
}
