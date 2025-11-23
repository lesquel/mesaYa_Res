import { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface ListSectionsQuery extends PaginatedQueryParams {
  restaurantId?: string;
  restaurantIds?: string[];
}
