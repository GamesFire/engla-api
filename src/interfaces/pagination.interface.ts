export interface IPaginationParams {
  page: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  results: T[];
  total: number;
}
