// ============================================================
// Pickup Entity Types
// Based on Nova Post API v1.0
// ============================================================

import type { AddressParts } from "@/entities/shipment/model/types";

export interface PickupAddressParts {
  city: string;
  region: string;
  street: string;
  postCode: string;
  building: string;
  flat: string;
  block: string;
  note: string;
}

/** Full Pickup entity */
export interface Pickup {
  id: string;
  number: string;
  status: PickupStatus;
  phone: string;
  email: string;
  fullName: string;
  companyTin: string;
  companyName: string;
  countryCode: string;
  addressParts: PickupAddressParts;
  pickedTimeFrom: string;
  pickedTimeTo: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  shipments: PickupShipment[];
}

export type PickupStatus =
  | "New"
  | "Confirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface PickupShipment {
  id: string;
  number: string;
  status: string;
}

// ----------------------------------------------------------
// Request DTOs
// ----------------------------------------------------------

export interface CreatePickupDto {
  note?: string;
  services: unknown[];
  phone: string;
  email: string;
  fullName: string;
  companyTin?: string;
  companyName?: string;
  countryCode: string;
  addressParts: PickupAddressParts;
  pickedTimeFrom: string;
  pickedTimeTo: string;
}

export interface UpdatePickupDto extends Partial<CreatePickupDto> {}

export interface GetPickupsParams {
  page?: number;
  limit?: number;
}

export interface PickupTimeInterval {
  from: string;
  to: string;
}
