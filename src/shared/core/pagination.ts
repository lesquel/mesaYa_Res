export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  offset: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  links?: {
    self: string;
    next?: string;
    prev?: string;
    first: string;
    last: string;
  };
}
