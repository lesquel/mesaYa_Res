import { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface ListMenusQuery extends PaginatedQueryParams {
  restaurantId?: string;
}
