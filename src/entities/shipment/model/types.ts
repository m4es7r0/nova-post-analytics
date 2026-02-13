// ============================================================
// Shipment Entity Types
// Based on Nova Post API v1.0
// ============================================================

/** Address parts used by sender/recipient */
export interface AddressParts {
  city: string;
  region: string;
  street: string;
  post_code: string;
  building: string;
  flat: string;
  block: string;
  note: string;
}

/** Sender or Recipient contact info */
export interface ShipmentContact {
  companyId: string | null;
  companyTin: string;
  companyName: string;
  phone: string;
  email: string;
  name: string;
  countryCode: string;
  settlementId: string;
  cityId: string | null;
  address: string;
  addressParts: AddressParts;
  divisionId: string;
  divisionCategory: string;
  archive: boolean;
  serviceType: string;
  ioss?: string;
  eoriCode?: string;
  registrationAddressParts?: AddressParts;
}

/** Parcel details within a shipment */
export interface Parcel {
  number: string;
  row_number: number;
  untied: boolean;
  cargo_category_id: string;
  cargo_category_group: string;
  parcel_description: string;
  insurance_cost: number;
  length: number;
  width: number;
  height: number;
  actual_weight: number;
  volumetric_weight: number;
  length_check: number | null;
  width_check: number | null;
  height_check: number | null;
  actual_weight_check: number | null;
  volumetric_weight_check: number | null;
}

/** Service additional parameters */
export interface ServiceAdditionalParams {
  divisionId: string | null;
  addressParts: AddressParts | null;
  cod: number | null;
  date: string | null;
  from: string | null;
  to: string | null;
  string: string | null;
  fullName: string | null;
  phone: string | null;
}

/** Service applied to a shipment */
export interface ShipmentService {
  id: number;
  shipment_parcel_row_number: number;
  service_id: string;
  service_type: string;
  service_name: string;
  service_code: string;
  parcel_number: string;
  payer_type: string;
  amount: number;
  price: number;
  discount: number;
  cost: number;
  cost_before_check: number | null;
  payment_status: string;
  currency_code: string;
  additional_parameters: ServiceAdditionalParams;
}

/** Online tracking summary */
export interface OnlineTracking {
  tracking_status_code: number;
  tracking_update_date: string;
  short_description: string;
  long_description: string;
  info: string;
  label: string;
}

/** Tracking event */
export interface TrackingEvent {
  number: string;
  date: string;
  division: string;
  settlement: string;
  event: string;
  event_status: string;
  code: string;
  division_name: string;
  settlement_name: string;
  event_name: string;
}

/** Shipment status enum */
export type ShipmentStatus =
  | "ReadyToShip"
  | "Received"
  | "InTransit"
  | "Delivered"
  | "Returned"
  | "Deleted"
  | "LoadingCourier"
  | "ArrivedAtDestination"
  | "ArrivedAtSortingCenter"
  | string; // API may return other statuses

/** Payment status */
export type PaymentStatus = "NeedPay" | "Paid" | "AfterpayAllowed";

/** Full Shipment entity */
export interface Shipment {
  id: string;
  version: number;
  number: string;
  dateTime: string;
  scheduledDeliveryDate: string;
  closingDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userCreate: string;
  status: ShipmentStatus;
  gtid: string;
  paymentStatus: PaymentStatus;
  currencyCode: string;
  parcelsAmount: number;
  note: string;
  payerType: string;
  payerContractId: string | null;
  payerContractNumber: string | null;
  postomatCellReservation: string;
  postomatOrderRef: string;
  firstDayStorage: string | null;
  cargoAutoReturnDate: string | null;
  marketplacePartner: string;
  registerNumber: string;
  pickupId: string;
  pickupNumber: string;
  pickupShipmentStatus: string;
  customerNote: string;
  creationDateNote: string;
  sender: ShipmentContact;
  recipient: ShipmentContact;
  parcels: Parcel[];
  services: ShipmentService[];
  onlineTracking: OnlineTracking;
  tracking: TrackingEvent[];
  totalWeight: number;
  totalInsuranceCost: number;
  totalCost: number;
}

// ----------------------------------------------------------
// Request DTOs
// ----------------------------------------------------------

/** Create shipment request body */
export interface CreateShipmentDto {
  status: ShipmentStatus;
  clientOrder?: string;
  note?: string;
  payerType: string;
  payerContractNumber?: string | null;
  invoice?: string | null;
  services: unknown[];
  parcels: CreateParcelDto[];
  sender: CreateContactDto;
  recipient: CreateContactDto;
}

export interface CreateParcelDto {
  cargoCategory: string;
  number?: string | null;
  parcelDescription: string;
  insuranceCost: string;
  rowNumber: number;
  untied?: boolean;
  width: number;
  length: number;
  height: number;
  actualWeight: number;
  volumetricWeight: number;
}

export interface CreateContactDto {
  companyTin?: string;
  companyName?: string;
  phone: string;
  email: string;
  name: string;
  countryCode: string;
  settlementId: number;
  address?: string | null;
  divisionId: number;
  ioss?: string | null;
  addressParts?: Partial<AddressParts>;
}

/** Created shipment response */
export interface ShipmentCreated {
  id: number;
  number: string;
  scheduledDeliveryDate: string;
  status: ShipmentStatus;
  cost: number;
  parcelsAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deliveryPartners: unknown[];
  services?: unknown[];
}

/** Calculate cost request */
export interface CalculateCostDto {
  payerType: string;
  services: unknown[];
  parcels: CreateParcelDto[];
  sender: { divisionId: number };
  recipient: { divisionId: number };
}

/** Calculate cost response */
export interface CostCalculation {
  sender: { countryCode: string; settlementId: number; divisionId: number };
  recipient: { countryCode: string; settlementId: number; divisionId: number };
  services: CostService[];
}

export interface CostService {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  amount: number;
  price: number;
  currencyCode: string;
  cost: number;
}

/** Tracking history response */
export interface TrackingHistoryResponse {
  items: TrackingHistoryItem[];
}

export interface TrackingHistoryItem {
  id: string;
  number: string;
  scheduled_delivery_date: string;
  history_tracking: HistoryTrackingEvent[];
}

export interface HistoryTrackingEvent {
  code: string;
  code_name: string;
  country_code: string;
  settlement: string;
  date: string;
}

/** Get shipments query params */
export interface GetShipmentsParams {
  ids?: string[];
  numbers?: string[];
  page?: number;
  limit?: number;
}

/** Print document params */
export interface PrintDocumentParams {
  type: "marking" | "international" | "invoice";
  numbers: string[];
}
