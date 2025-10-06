import { Restaurant } from '../../domain/index.js';
import { ListRestaurantsQuery } from '../dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';

export const RESTAURANT_REPOSITORY = Symbol('RESTAURANT_REPOSITORY');

export interface RestaurantRepositoryPort {
  save(restaurant: Restaurant): Promise<Restaurant>;
  findById(id: string): Promise<Restaurant | null>;
  delete(id: string): Promise<void>;
  paginate(query: ListRestaurantsQuery): Promise<PaginatedResult<Restaurant>>;
  paginateByOwner(
    ownerId: string,
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<Restaurant>>;
}
