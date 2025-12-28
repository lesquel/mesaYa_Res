import { PaginatedQueryParams } from '@shared/application/types';

export interface DishListQuery extends PaginatedQueryParams {
  restaurantId?: string;
  menuId?: string;
}
