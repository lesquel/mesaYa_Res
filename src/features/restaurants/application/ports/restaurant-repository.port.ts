import { RestaurantEntity } from '../../domain/index.js';
import { ListRestaurantsQuery } from '../dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';

export const RESTAURANT_REPOSITORY = Symbol('RESTAURANT_REPOSITORY');

export interface RestaurantRepositoryPort {
  save(restaurant: RestaurantEntity): Promise<RestaurantEntity>;
  findById(id: string): Promise<RestaurantEntity | null>;
  delete(id: string): Promise<void>;
  paginate(
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<RestaurantEntity>>;
  paginateByOwner(
    ownerId: string,
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<RestaurantEntity>>;
}
