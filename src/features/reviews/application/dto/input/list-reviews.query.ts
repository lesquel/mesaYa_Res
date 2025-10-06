import { PaginationQuery } from '@shared/application/types/pagination.js';

export interface ListReviewsQuery {
  pagination: PaginationQuery;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  route: string;
}
