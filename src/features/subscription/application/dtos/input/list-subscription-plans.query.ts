import { PaginationQuery } from '@shared/application/types/pagination';

export interface ListSubscriptionPlansQuery {
  pagination: PaginationQuery;
  route: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}
