import "server-only";

import { getNovaPostClient } from "@/shared/api/nova-post-client";
import type { PaginatedResponse, ApiResult } from "@/shared/api/types";
import type {
  Shipment,
  ShipmentCreated,
  CreateShipmentDto,
  CalculateCostDto,
  CostCalculation,
  GetShipmentsParams,
  PrintDocumentParams,
  TrackingHistoryResponse,
} from "../model/types";

// ============================================================
// Shipment API Module (server-only)
// ============================================================

const client = (apiKey: string) => getNovaPostClient(apiKey);

const SHIPMENTS_CACHE_TTL_MS = 60 * 1000;
const MAX_SHIPMENTS_CACHE_ENTRIES = 200;

interface ShipmentsCacheEntry {
  expiresAt: number;
  value: ApiResult<PaginatedResponse<Shipment>>;
}

const shipmentsCache = new Map<string, ShipmentsCacheEntry>();
const inFlightShipmentsRequests = new Map<
  string,
  Promise<ApiResult<PaginatedResponse<Shipment>>>
>();

function buildShipmentsCacheKey(
  apiKey: string,
  params: GetShipmentsParams
): string {
  const idsPart = params.ids?.join(",") || "";
  const numbersPart = params.numbers?.join(",") || "";
  const pagePart = String(params.page ?? 1);
  const limitPart = String(params.limit ?? 15);
  return `${apiKey}|${pagePart}|${limitPart}|${idsPart}|${numbersPart}`;
}

function getCachedShipments(
  key: string
): ApiResult<PaginatedResponse<Shipment>> | null {
  const entry = shipmentsCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    shipmentsCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedShipments(
  key: string,
  value: ApiResult<PaginatedResponse<Shipment>>
): void {
  shipmentsCache.set(key, { value, expiresAt: Date.now() + SHIPMENTS_CACHE_TTL_MS });
  if (shipmentsCache.size > MAX_SHIPMENTS_CACHE_ENTRIES) {
    const oldestKey = shipmentsCache.keys().next().value as string | undefined;
    if (oldestKey) shipmentsCache.delete(oldestKey);
  }
}

/** Fetch shipments list with pagination and optional filters */
export async function getShipments(
  params: GetShipmentsParams = {},
  apiKey: string
): Promise<ApiResult<PaginatedResponse<Shipment>>> {
  const { ids, numbers, page = 1, limit = 15 } = params;
  const cacheKey = buildShipmentsCacheKey(apiKey, { ids, numbers, page, limit });
  const cached = getCachedShipments(cacheKey);
  if (cached) return cached;

  const inFlight = inFlightShipmentsRequests.get(cacheKey);
  if (inFlight) return inFlight;

  const requestPromise = (async () => {
    const queryParams: Record<string, string | string[] | number | undefined> = {
      page,
      limit,
    };

    if (ids?.length) queryParams.ids = ids;
    if (numbers?.length) queryParams.numbers = numbers;

    const result = await client(apiKey).get<PaginatedResponse<Shipment>>(
      "/shipments",
      queryParams
    );

    if (result.success) {
      setCachedShipments(cacheKey, result);
    }

    return result;
  })();

  inFlightShipmentsRequests.set(cacheKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inFlightShipmentsRequests.delete(cacheKey);
  }
}

/** Create a new shipment document */
export async function createShipment(
  data: CreateShipmentDto,
  apiKey: string
): Promise<ApiResult<ShipmentCreated>> {
  return client(apiKey).post<ShipmentCreated>("/shipments", data);
}

/** Calculate delivery cost */
export async function calculateCost(
  data: CalculateCostDto,
  apiKey: string
): Promise<ApiResult<CostCalculation>> {
  return client(apiKey).post<CostCalculation>("/shipments/calculations", data);
}

/** Update an existing shipment */
export async function updateShipment(
  id: string,
  data: Partial<CreateShipmentDto>,
  apiKey: string
): Promise<ApiResult<ShipmentCreated>> {
  return client(apiKey).put<ShipmentCreated>(`/shipments/${id}`, data);
}

/** Delete a shipment */
export async function deleteShipment(
  id: string,
  apiKey: string
): Promise<ApiResult<{ message: string }>> {
  return client(apiKey).delete<{ message: string }>(`/shipments/${id}`);
}

/** Get tracking history for shipments */
export async function getTrackingHistory(
  numbers: string[],
  apiKey: string
): Promise<ApiResult<TrackingHistoryResponse>> {
  return client(apiKey).get<TrackingHistoryResponse>("/shipments/tracking/history/", {
    numbers,
  });
}

/** Print shipment documents (returns PDF as ArrayBuffer) */
export async function printDocuments(
  params: PrintDocumentParams,
  apiKey: string
): Promise<ApiResult<ArrayBuffer>> {
  return client(apiKey).get<ArrayBuffer>("/shipments/print", {
    type: params.type,
    numbers: params.numbers,
  });
}
