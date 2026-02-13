import "server-only";

import { getNovaPostClient } from "@/shared/api/nova-post-client";
import type { PaginatedResponse, ApiResult } from "@/shared/api/types";
import type {
  Pickup,
  CreatePickupDto,
  UpdatePickupDto,
  GetPickupsParams,
  PickupTimeInterval,
} from "../model/types";

// ============================================================
// Pickup API Module (server-only)
// ============================================================

const client = (apiKey: string) => getNovaPostClient(apiKey);

/** Get list of courier pickups */
export async function getPickups(
  params: GetPickupsParams = {},
  apiKey: string
): Promise<ApiResult<PaginatedResponse<Pickup>>> {
  return client(apiKey).get<PaginatedResponse<Pickup>>("/pickups", {
    page: params.page,
    limit: params.limit,
  });
}

/** Create a new courier pickup */
export async function createPickup(
  data: CreatePickupDto,
  apiKey: string
): Promise<ApiResult<Pickup>> {
  return client(apiKey).post<Pickup>("/pickups", data);
}

/** Update an existing courier pickup */
export async function updatePickup(
  id: string,
  data: UpdatePickupDto,
  apiKey: string
): Promise<ApiResult<Pickup>> {
  return client(apiKey).put<Pickup>(`/pickups/${id}`, data);
}

/** Delete a courier pickup */
export async function deletePickup(
  id: string,
  apiKey: string
): Promise<ApiResult<{ message: string }>> {
  return client(apiKey).delete<{ message: string }>(`/pickups/${id}`);
}

/** Add shipments to a courier pickup */
export async function addShipmentsToPickup(
  pickupId: string,
  shipmentIds: string[],
  apiKey: string
): Promise<ApiResult<unknown>> {
  return client(apiKey).post(`/pickups/${pickupId}/shipments`, {
    shipments: shipmentIds,
  });
}

/** Remove shipments from a pickup */
export async function removeShipmentsFromPickup(
  pickupId: string,
  shipmentIds: string[],
  apiKey: string
): Promise<ApiResult<unknown>> {
  return client(apiKey).delete(`/pickups/${pickupId}/shipments`, {
    shipments: shipmentIds,
  });
}

/** Update pickup request status */
export async function updatePickupStatus(
  id: string,
  status: string,
  apiKey: string
): Promise<ApiResult<Pickup>> {
  return client(apiKey).put<Pickup>(`/pickups/${id}/status`, { status });
}

/** Retrieve available time intervals for pickup */
export async function getPickupTimeIntervals(
  apiKey: string
): Promise<ApiResult<PickupTimeInterval[]>> {
  return client(apiKey).get<PickupTimeInterval[]>("/pickups/time-intervals");
}
