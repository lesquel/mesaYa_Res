import { PaginationQuery } from '@shared/application/interfaces/pagination.js';

export interface ListSectionsQuery {
  pagination: PaginationQuery;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  route: string;
}
