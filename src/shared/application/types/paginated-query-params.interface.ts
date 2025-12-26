/**
 * Paginated query params interface.
 *
 * Parameters for paginated queries including sorting and filtering.
 */

import { PaginationQuery } from './pagination-query.interface';

export interface PaginatedQueryParams {
  pagination: PaginationQuery;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  route: string;
  filters?: Record<string, string>;
}
