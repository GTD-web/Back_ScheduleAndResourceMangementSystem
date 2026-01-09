export interface PaginationMeta {
  total: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
} 