import { PaginatedQueryParams } from '@shared/application/types';

export interface ListTablesQuery extends PaginatedQueryParams {
  sectionId?: string;
  restaurantId?: string;
  restaurantIds?: string[];
}
