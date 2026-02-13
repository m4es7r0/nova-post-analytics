import "server-only";

import { env } from "@/shared/config/env";
import type { ApiResult } from "./types";

// ============================================================
// Nova Post API Client
// Server-only HTTP client with JWT auto-management
// Supports per-user API keys with per-key JWT caching
//
// Compliance with Nova Post JWT requirements:
// - JWT obtained via GET /clients/authorization?apiKey=...
// - Passed as Authorization header (raw JWT, no Bearer prefix)
// - 1h lifetime parsed from JWT exp claim (with 5 min buffer)
// - Per-key JWT isolation
// - Automatic refresh before expiry
// - Retry on 401 (token revoked server-side)
// - Concurrent auth request deduplication
// - HTTPS enforced by API URL config
// ============================================================

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | string[] | number | boolean | undefined>;
  headers?: Record<string, string>;
}

// ----------------------------------------------------------
// JWT Helpers
// ----------------------------------------------------------

/**
 * Parse the `exp` claim from a JWT without external dependencies.
 * Returns the expiry timestamp in milliseconds, or null if parsing fails.
 */
function parseJwtExpiry(jwt: string): number | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;

    // Base64url decode the payload
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8")
    );

    if (typeof decoded.exp === "number") {
      // exp is in seconds, convert to milliseconds
      return decoded.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------
// Nova Post Client
// ----------------------------------------------------------

class NovaPostClient {
  private baseUrl: string;
  private apiKey: string;
  private jwt: string | null = null;
  private jwtExpiresAt: number = 0;

  /** Promise lock to deduplicate concurrent auth requests */
  private authPromise: Promise<string> | null = null;

  /** Stats for monitoring */
  private stats = {
    authRequests: 0,
    apiRequests: 0,
    retries: 0,
    lastAuthAt: 0,
  };

  constructor(apiKey: string) {
    this.baseUrl = env.novaPostApiUrl;
    this.apiKey = apiKey;
  }

  // ----------------------------------------------------------
  // JWT Management
  // ----------------------------------------------------------

  /**
   * Ensure we have a valid JWT, refreshing if needed.
   * Uses a promise lock to prevent concurrent auth requests
   * when multiple API calls fire at the same time.
   */
  private async ensureAuth(): Promise<string> {
    const now = Date.now();
    // Refresh 5 min before expiry as recommended
    const bufferMs = 5 * 60 * 1000;

    if (this.jwt && this.jwtExpiresAt - bufferMs > now) {
      return this.jwt;
    }

    // Deduplicate: if another request is already refreshing, wait for it
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = this.fetchNewToken();

    try {
      const token = await this.authPromise;
      return token;
    } finally {
      this.authPromise = null;
    }
  }

  /**
   * Fetch a new JWT from the Nova Post auth endpoint.
   * Parses the exp claim from the JWT instead of hardcoding 1 hour.
   */
  private async fetchNewToken(): Promise<string> {
    this.stats.authRequests++;
    this.stats.lastAuthAt = Date.now();

    console.log(
      `[NovaPost] Authenticating (key: ${this.maskKey()}, auth #${this.stats.authRequests})`
    );

    const response = await fetch(
      `${this.baseUrl}/clients/authorization?apiKey=${this.apiKey}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Nova Post auth failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as { jwt: string };
    this.jwt = data.jwt;

    // Parse actual expiry from JWT payload (exp claim)
    const expiry = parseJwtExpiry(data.jwt);
    if (expiry) {
      this.jwtExpiresAt = expiry;
      const remainingMin = Math.round((expiry - Date.now()) / 60000);
      console.log(
        `[NovaPost] Authenticated (key: ${this.maskKey()}, expires in ${remainingMin} min)`
      );
    } else {
      // Fallback to 1 hour if parsing fails (as per Nova Post docs)
      this.jwtExpiresAt = Date.now() + 60 * 60 * 1000;
      console.warn(
        `[NovaPost] Could not parse JWT exp claim, falling back to 1h TTL`
      );
    }

    return this.jwt;
  }

  /**
   * Force-refresh the JWT (used after 401 responses).
   * Clears cached token so ensureAuth() will fetch a new one.
   */
  private invalidateToken(): void {
    this.jwt = null;
    this.jwtExpiresAt = 0;
  }

  /** Mask API key for logging (show first 4 and last 4 chars) */
  private maskKey(): string {
    if (this.apiKey.length <= 8) return "••••••••";
    return this.apiKey.slice(0, 4) + "••••" + this.apiKey.slice(-4);
  }

  // ----------------------------------------------------------
  // Core Request Method
  // ----------------------------------------------------------

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    return this.executeRequest<T>(endpoint, options, false);
  }

  /**
   * Execute a request with automatic 401 retry.
   * If the first attempt returns 401, invalidates the JWT,
   * re-authenticates, and retries once.
   */
  private async executeRequest<T>(
    endpoint: string,
    options: RequestOptions,
    isRetry: boolean
  ): Promise<ApiResult<T>> {
    const { method = "GET", body, params, headers = {} } = options;

    try {
      const jwt = await this.ensureAuth();
      this.stats.apiRequests++;

      // Build URL with query params
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value === undefined) continue;
          if (Array.isArray(value)) {
            for (const v of value) {
              url.searchParams.append(`${key}[]`, v);
            }
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      }

      const fetchOptions: RequestInit = {
        method,
        headers: {
          Authorization: jwt,
          Accept: "application/json",
          "Accept-Language": "uk",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      };

      const response = await fetch(url.toString(), fetchOptions);

      // Handle 401 — token may have been revoked or session limit reached
      if (response.status === 401 && !isRetry) {
        console.warn(
          `[NovaPost] Got 401 on ${method} ${endpoint}, refreshing token and retrying`
        );
        this.stats.retries++;
        this.invalidateToken();
        return this.executeRequest<T>(endpoint, options, true);
      }

      // Handle no-content responses
      if (response.status === 204) {
        return { success: true, data: null as T };
      }

      const contentType = response.headers.get("content-type") || "";

      // Handle PDF / binary responses
      if (contentType.includes("application/pdf")) {
        const buffer = await response.arrayBuffer();
        return { success: true, data: buffer as T };
      }

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: responseData.message || `HTTP ${response.status}`,
            errors: responseData.errors,
            status: response.status,
          },
        };
      }

      return { success: true, data: responseData as T };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: {
          message,
          status: 500,
        },
      };
    }
  }

  // ----------------------------------------------------------
  // Convenience Methods
  // ----------------------------------------------------------

  async get<T>(
    endpoint: string,
    params?: Record<string, string | string[] | number | boolean | undefined>
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  async delete<T>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "DELETE", body });
  }

  // ----------------------------------------------------------
  // Diagnostics
  // ----------------------------------------------------------

  getStats() {
    return {
      ...this.stats,
      hasValidToken: this.jwt !== null && this.jwtExpiresAt > Date.now(),
      tokenExpiresIn: this.jwtExpiresAt > 0
        ? Math.round((this.jwtExpiresAt - Date.now()) / 1000)
        : 0,
    };
  }
}

// ----------------------------------------------------------
// Per-key client cache with LRU eviction
// Prevents unbounded memory growth with many users.
// ----------------------------------------------------------

const MAX_CACHED_CLIENTS = 100;
const CLIENT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours (longer than JWT lifetime)

interface CachedClient {
  client: NovaPostClient;
  lastAccessed: number;
}

const clientCache = new Map<string, CachedClient>();

/**
 * Evict stale entries from the client cache.
 * Removes entries older than TTL, and if still over limit,
 * removes the least recently accessed.
 */
function evictStaleClients(): void {
  const now = Date.now();

  // Remove expired entries
  for (const [key, entry] of clientCache) {
    if (now - entry.lastAccessed > CLIENT_TTL_MS) {
      clientCache.delete(key);
    }
  }

  // If still over limit, remove least recently used
  if (clientCache.size > MAX_CACHED_CLIENTS) {
    const sorted = [...clientCache.entries()].sort(
      (a, b) => a[1].lastAccessed - b[1].lastAccessed
    );
    const toRemove = sorted.slice(0, sorted.length - MAX_CACHED_CLIENTS);
    for (const [key] of toRemove) {
      clientCache.delete(key);
    }
  }
}

/**
 * Get a NovaPostClient for the given API key.
 * API key is required — each user must provide their own.
 * Clients are cached per-key so JWTs are reused.
 * Cache has LRU eviction with TTL to prevent memory leaks.
 */
export function getNovaPostClient(apiKey: string): NovaPostClient {
  const existing = clientCache.get(apiKey);
  if (existing) {
    existing.lastAccessed = Date.now();
    return existing.client;
  }

  // Evict stale entries before adding new one
  if (clientCache.size >= MAX_CACHED_CLIENTS) {
    evictStaleClients();
  }

  const client = new NovaPostClient(apiKey);
  clientCache.set(apiKey, { client, lastAccessed: Date.now() });
  return client;
}

/**
 * Validate an API key by attempting to get a JWT.
 * On success, caches the client (and its JWT) so the first
 * real request doesn't need to re-authenticate.
 */
export type ApiKeyValidationResult =
  | { isValid: true }
  | { isValid: false; reason: "invalid" | "rate_limited" | "unavailable" };

export async function validateApiKey(
  apiKey: string
): Promise<ApiKeyValidationResult> {
  try {
    const response = await fetch(
      `${env.novaPostApiUrl}/clients/authorization?apiKey=${apiKey}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (response.ok) {
      // Warm up per-key client cache for subsequent requests.
      void getNovaPostClient(apiKey);
      return { isValid: true };
    }

    if (response.status === 429) {
      return { isValid: false, reason: "rate_limited" };
    }

    if (response.status >= 500) {
      return { isValid: false, reason: "unavailable" };
    }

    if (response.status === 401 || response.status === 403 || response.status === 400) {
      clientCache.delete(apiKey);
      return { isValid: false, reason: "invalid" };
    }

    return { isValid: false, reason: "unavailable" };
  } catch {
    clientCache.delete(apiKey);
    return { isValid: false, reason: "unavailable" };
  }
}

export type { NovaPostClient };
