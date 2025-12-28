import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { RestaurantEntity } from '../../domain';
import { ListNearbyRestaurantsQuery, ListRestaurantsQuery } from '../dto';
import { PaginatedResult } from '@shared/application/types';
import type { RestaurantCreate, RestaurantUpdate } from '../../domain/types';
import type { RestaurantOwnerOptionDto } from '../dto';

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
  abstract listOwners(): Promise<RestaurantOwnerOptionDto[]>;
  abstract assignOwner(
    restaurantId: string,
    ownerId: string,
  ): Promise<RestaurantEntity>;
  abstract findNearby(
    query: ListNearbyRestaurantsQuery,
  ): Promise<
    Array<{ restaurant: RestaurantEntity; distanceKm: number | null }>
  >;
  /** Find a restaurant by exact name (case-insensitive) */
  abstract findByName(name: string): Promise<RestaurantEntity | null>;
}
