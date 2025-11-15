import { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface DishListQuery extends PaginatedQueryParams {
  restaurantId?: string;
}
