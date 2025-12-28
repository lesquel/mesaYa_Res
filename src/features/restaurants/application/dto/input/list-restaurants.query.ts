import { PaginatedQueryParams } from '@shared/application/types';

export interface ListRestaurantsQuery extends PaginatedQueryParams {
  /** Filter by restaurant name (partial match) */
  name?: string;
  /** Filter by city/location */
  city?: string;
  /** Filter by cuisine type */
  cuisineType?: string;
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by owner ID */
  ownerId?: string;
}
