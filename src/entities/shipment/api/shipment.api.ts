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

/** Fetch shipments list with pagination and optional filters */
export async function getShipments(
  params: GetShipmentsParams = {},
  apiKey: string
): Promise<ApiResult<PaginatedResponse<Shipment>>> {
  const { ids, numbers, page = 1, limit = 15 } = params;

  const queryParams: Record<string, string | string[] | number | undefined> = {
    page,
    limit,
  };

  if (ids?.length) queryParams.ids = ids;
  if (numbers?.length) queryParams.numbers = numbers;

  return client(apiKey).get<PaginatedResponse<Shipment>>("/shipments", queryParams);
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
