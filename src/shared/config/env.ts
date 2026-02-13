import "server-only";

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarOptional(key: string): string | undefined {
  return process.env[key] || undefined;
}

export const env = {
  get novaPostApiUrl() {
    return getEnvVar("NOVA_POST_API_URL");
  },
  /** Returns the env API key or undefined (per-user keys are primary) */
  get novaPostApiKey() {
    return getEnvVarOptional("NOVA_POST_API_KEY");
  },
  get betterAuthSecret() {
    return getEnvVar("BETTER_AUTH_SECRET");
  },
  get betterAuthUrl() {
    return getEnvVar("BETTER_AUTH_URL");
  },
} as const;
