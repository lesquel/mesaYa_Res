import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import type {
  PaginatedQueryParams,
  PaginatedResult,
} from '@shared/application/types';

import { DishEntity } from '../entities/dish.entity';
import { DishCreate, DishUpdate } from '../types';

export abstract class IDishRepositoryPort extends IBaseRepositoryPort<
  DishEntity,
  DishCreate,
  DishUpdate
> {
  abstract paginate(
    params: PaginatedQueryParams,
  ): Promise<PaginatedResult<DishEntity>>;

  abstract paginateByRestaurant(
    restaurantId: string,
    params: PaginatedQueryParams,
  ): Promise<PaginatedResult<DishEntity>>;

  abstract paginateByMenu(
    menuId: string,
    params: PaginatedQueryParams,
  ): Promise<PaginatedResult<DishEntity>>;
}
