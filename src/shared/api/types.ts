// ============================================================
// Shared API types for Nova Post API responses
// ============================================================

/** Standard paginated response wrapper from Nova Post API */
export interface PaginatedResponse<T> {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  items: T[];
}

/** Pagination query parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** API error response */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

/** Result type for API calls */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
