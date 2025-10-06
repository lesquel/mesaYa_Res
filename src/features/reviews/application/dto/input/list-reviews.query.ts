import { PaginationQuery } from '@shared/interfaces/pagination.js';

export interface ListReviewsQuery {
  pagination: PaginationQuery;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  route: string;
}
