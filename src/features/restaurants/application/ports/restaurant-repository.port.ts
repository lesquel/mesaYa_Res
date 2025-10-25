import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { RestaurantEntity } from '../../domain/index';
import { ListRestaurantsQuery } from '../dto/index';
import { PaginatedResult } from '@shared/application/types/pagination';
import type { RestaurantCreate, RestaurantUpdate } from '../../domain/types';

export const RESTAURANT_REPOSITORY = Symbol('RESTAURANT_REPOSITORY');

export abstract class RestaurantRepositoryPort extends IBaseRepositoryPort<
  RestaurantEntity,
  RestaurantCreate,
  RestaurantUpdate
> {
  abstract save(restaurant: RestaurantEntity): Promise<RestaurantEntity>;
  abstract paginate(
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<RestaurantEntity>>;
  abstract paginateByOwner(
    ownerId: string,
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<RestaurantEntity>>;
}
