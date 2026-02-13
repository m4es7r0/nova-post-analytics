import "server-only";

import { getNovaPostClient } from "@/shared/api/nova-post-client";
import type { PaginatedResponse, ApiResult } from "@/shared/api/types";
import type {
  Registry,
  CreateRegistryDto,
  GetRegistriesParams,
  AddShipmentsToRegistryDto,
  RenameRegistryDto,
} from "../model/types";

// ============================================================
// Registry API Module (server-only)
// ============================================================

const client = (apiKey: string) => getNovaPostClient(apiKey);

/** Get registries with filters */
export async function getRegistries(
  params: GetRegistriesParams = {},
  apiKey: string
): Promise<ApiResult<PaginatedResponse<Registry>>> {
  const queryParams: Record<string, string | string[] | number | undefined> = {
    page: params.page,
    limit: params.limit,
    createdAtFrom: params.createdAtFrom,
    createdAtTo: params.createdAtTo,
  };

  if (params.ids?.length) queryParams.ids = params.ids;
  if (params.numbers?.length) queryParams.numbers = params.numbers;
  if (params.settlementIds?.length)
    queryParams.settlementIds = params.settlementIds;

  return client(apiKey).get<PaginatedResponse<Registry>>("/registry/", queryParams);
}

/** Create a new shipment registry */
export async function createRegistry(
  data: CreateRegistryDto,
  apiKey: string
): Promise<ApiResult<Registry>> {
  return client(apiKey).post<Registry>("/registry/", data);
}

/** Add shipments to an existing registry */
export async function addShipmentsToRegistry(
  registryId: string,
  data: AddShipmentsToRegistryDto,
  apiKey: string
): Promise<ApiResult<Registry>> {
  return client(apiKey).post<Registry>(`/registry/${registryId}/shipments`, data);
}

/** Remove shipments from a registry */
export async function removeShipmentsFromRegistry(
  registryId: string,
  shipmentIds: string[],
  apiKey: string
): Promise<ApiResult<{ success: boolean }>> {
  return client(apiKey).delete<{ success: boolean }>(
    `/registry/${registryId}/shipments`,
    { shipments: shipmentIds }
  );
}

/** Rename a registry */
export async function renameRegistry(
  registryId: string,
  data: RenameRegistryDto,
  apiKey: string
): Promise<ApiResult<Registry>> {
  return client(apiKey).put<Registry>(`/registry/${registryId}/rename`, data);
}

/** Delete a registry */
export async function deleteRegistry(
  registryId: string,
  apiKey: string
): Promise<ApiResult<{ success: boolean }>> {
  return client(apiKey).delete<{ success: boolean }>(`/registry/${registryId}`);
}
