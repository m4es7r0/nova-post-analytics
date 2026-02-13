// ============================================================
// Service Entity Types (Exchange Rates, etc.)
// Based on Nova Post API v1.0
// ============================================================

export interface ExchangeRate {
  currencyCodeA: string;
  currencyCodeB: string;
  rateBuy: number;
  rateSell: number;
  date: string;
}

export interface GetExchangeRatesParams {
  currencyCodeA?: string;
  currencyCodeB?: string;
}
