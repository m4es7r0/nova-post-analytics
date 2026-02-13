// ============================================================
// Registry Entity Types
// Based on Nova Post API v1.0
// ============================================================

export interface RegistryAddressParts {
  city: string | null;
  region: string | null;
  street: string | null;
  streetId: string | null;
  postCode: string | null;
  building: string | null;
  flat: string | null;
  block: string | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  addressId: string | null;
}

/** Full Registry entity */
export interface Registry {
  id: string;
  number: string;
  versionTracking: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  posted: boolean;
  printed: boolean;
  description: string;
  senderCompanyId: string;
  senderCompanyTin: string;
  senderPhone: string;
  senderCountryCode: string;
  senderSettlementId: string;
  senderSettlementExternalId: string;
  senderSettlementName: string;
  senderDivisionId: string;
  senderDivisionExternalId: string;
  senderDivisionName: string;
  senderAddress: string;
  senderAddressParts: RegistryAddressParts;
  shipments: RegistryShipment[];
}

export interface RegistryShipment {
  shipmentId: string;
  shipmentNumber: string;
}

// ----------------------------------------------------------
// Request DTOs
// ----------------------------------------------------------

export interface CreateRegistryDto {
  description: string;
  shipments: string[];
}

export interface GetRegistriesParams {
  ids?: string[];
  numbers?: string[];
  settlementIds?: string[];
  createdAtFrom?: string;
  createdAtTo?: string;
  page?: number;
  limit?: number;
}

export interface AddShipmentsToRegistryDto {
  shipments: string[];
}

export interface RenameRegistryDto {
  description: string;
}
