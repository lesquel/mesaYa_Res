import { PaginatedQueryParams } from '@shared/application/types';

export interface MenuPaginatedQuery extends PaginatedQueryParams {
  restaurantId?: string;
}
