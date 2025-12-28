import { PaginatedQueryParams } from '@shared/application/types';

export interface ListMenusQuery extends PaginatedQueryParams {
  restaurantId?: string;
}
