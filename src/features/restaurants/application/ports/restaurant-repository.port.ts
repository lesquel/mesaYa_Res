import { RestaurantEntity } from '../../domain/index';
import { ListRestaurantsQuery } from '../dto/index';
import { PaginatedResult } from '@shared/application/types/pagination';

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
