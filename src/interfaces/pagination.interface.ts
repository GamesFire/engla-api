export interface PaginationParams {
  page: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
}
