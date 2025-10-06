import { PaginationQuery } from '../../../../../shared/interfaces/pagination.js';

export interface ListSectionsQuery {
  pagination: PaginationQuery;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  route: string;
}
