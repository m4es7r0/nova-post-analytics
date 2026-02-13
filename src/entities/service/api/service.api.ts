import "server-only";

import { getNovaPostClient } from "@/shared/api/nova-post-client";
import type { ApiResult } from "@/shared/api/types";
import type { ExchangeRate } from "../model/types";

// ============================================================
// Services API Module (server-only)
// ============================================================

const client = (apiKey: string) => getNovaPostClient(apiKey);

/** Get exchange rates */
export async function getExchangeRates(apiKey: string): Promise<ApiResult<ExchangeRate[]>> {
  return client(apiKey).get<ExchangeRate[]>("/exchange-rates");
}
