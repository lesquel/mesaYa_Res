import { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface ListUsersQuery extends PaginatedQueryParams {
  role?: string;
  active?: boolean;
  /** Optional: scope users that have reservations in this restaurant */
  restaurantId?: string;
}

export type { ListUsersQuery as ListUsersQueryType };
