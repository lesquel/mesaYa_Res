import { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface ListTablesQuery extends PaginatedQueryParams {
  sectionId?: string;
  restaurantId?: string;
  restaurantIds?: string[];
}
