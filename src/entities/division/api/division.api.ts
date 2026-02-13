import "server-only";

import { getNovaPostClient } from "@/shared/api/nova-post-client";
import type { PaginatedResponse, ApiResult } from "@/shared/api/types";
import type {
  Division,
  GetDivisionsParams,
  Measurement,
  Currency,
  CargoClassifier,
} from "../model/types";

// ============================================================
// Dictionaries API Module (server-only)
// ============================================================

const client = (apiKey: string) => getNovaPostClient(apiKey);

/** Find divisions (branches, lockers) */
export async function getDivisions(
  params: GetDivisionsParams = {},
  apiKey: string
): Promise<ApiResult<PaginatedResponse<Division>>> {
  const queryParams: Record<string, string | string[] | number | undefined> = {
    page: params.page,
    limit: params.limit,
    latitude: params.latitude,
    longitude: params.longitude,
  };

  if (params.countryCodes?.length) {
    queryParams.countryCodes = params.countryCodes;
  }
  if (params.settlementIds?.length) {
    queryParams.settlementIds = params.settlementIds.map(String);
  }
  if (params.divisionCategories?.length) {
    queryParams.divisionCategories = params.divisionCategories;
  }

  return client(apiKey).get<PaginatedResponse<Division>>("/divisions", queryParams);
}

/** Find measurement units */
export async function getMeasurements(apiKey: string): Promise<ApiResult<Measurement[]>> {
  return client(apiKey).get<Measurement[]>("/measurements");
}

/** Find currencies */
export async function getCurrencies(apiKey: string): Promise<ApiResult<Currency[]>> {
  return client(apiKey).get<Currency[]>("/currencies");
}

/** Find cargo classifiers (UKT ZED) */
export async function getCargoClassifiers(
  apiKey: string
): Promise<ApiResult<CargoClassifier[]>> {
  return client(apiKey).get<CargoClassifier[]>("/cargo-classifiers");
}
