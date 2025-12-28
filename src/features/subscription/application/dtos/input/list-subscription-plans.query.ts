import { PaginationQuery } from '@shared/application/types';

export interface ListSubscriptionPlansQuery {
  pagination: PaginationQuery;
  route: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}
