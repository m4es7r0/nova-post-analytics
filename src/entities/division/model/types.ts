// ============================================================
// Division (Branch / Locker) Entity Types
// Based on Nova Post API v1.0
// ============================================================

/** Country codes supported by Nova Post */
export type CountryCode =
  | "CZ"
  | "DE"
  | "EE"
  | "HU"
  | "LT"
  | "LV"
  | "MD"
  | "PL"
  | "RO"
  | "SK"
  | "UA";

/** Division category */
export type DivisionCategory = "PostBranch" | "PostLocker" | "CargoBranch";

/** Settlement (city/town) nested in division response */
export interface Settlement {
  id: number;
  name: string;
  region?: {
    id: number;
    name: string;
    parent?: {
      id: number;
      name: string;
    };
  };
}

/** Division entity (matches API response) */
export interface Division {
  id: string;
  externalId: string;
  name: string;
  shortName: string;
  number: string;
  category: DivisionCategory;
  countryCode: CountryCode;
  settlementId: string;
  settlement?: Settlement;
  address: string;
  latitude: number;
  longitude: number;
  schedule: DivisionSchedule;
  maxWeight: number;
  maxLength: number;
  maxWidth: number;
  maxHeight: number;
}

export interface DivisionSchedule {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

/** Query params for finding divisions */
export interface GetDivisionsParams {
  page?: number;
  limit?: number;
  countryCodes?: CountryCode[];
  settlementIds?: number[];
  divisionCategories?: DivisionCategory[];
  latitude?: number;
  longitude?: number;
}

/** Measurement unit */
export interface Measurement {
  id: string;
  name: string;
  code: string;
}

/** Currency */
export interface Currency {
  id: string;
  code: string;
  name: string;
}

/** Cargo classifier (UKT ZED) */
export interface CargoClassifier {
  id: string;
  code: string;
  name: string;
  description: string;
}
