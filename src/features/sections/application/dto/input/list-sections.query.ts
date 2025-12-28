import { PaginatedQueryParams } from '@shared/application/types';

export interface ListSectionsQuery extends PaginatedQueryParams {
  restaurantId?: string;
  restaurantIds?: string[];
}
