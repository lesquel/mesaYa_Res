import { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface MenuPaginatedQuery extends PaginatedQueryParams {
  restaurantId?: string;
}
