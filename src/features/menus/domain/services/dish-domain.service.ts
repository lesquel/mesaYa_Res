import { IDishRepositoryPort } from '../repositories/dish-repository.port';
import { DishEntity } from '../entities/dish.entity';
import { DishCreate, DishUpdate } from '../types';
import {
  DishNotFoundError,
  DishCreationFailedError,
  DishUpdateFailedError,
  DishDeletionFailedError,
} from '../errors';
import type { DishListQuery } from '../types';
import { PaginatedResult } from '@shared/application/types';

export class DishDomainService {
  constructor(private readonly dishRepository: IDishRepositoryPort) {}

  async createDish(data: DishCreate): Promise<DishEntity> {
    const dish = await this.dishRepository.create(data);

    if (!dish) {
      throw new DishCreationFailedError('Repository returned null', {
        restaurantId: data.restaurantId,
      });
    }

    return dish;
  }

  async updateDish(data: DishUpdate): Promise<DishEntity> {
    const updated = await this.dishRepository.update(data);

    if (!updated) {
      throw new DishUpdateFailedError(data.dishId, 'Repository returned null');
    }

    return updated;
  }

  async findDishById(dishId: string): Promise<DishEntity> {
    const dish = await this.dishRepository.findById(dishId);

    if (!dish) {
      throw new DishNotFoundError(dishId);
    }

    return dish;
  }

  async findAllDishes(): Promise<DishEntity[]> {
    return this.dishRepository.findAll();
  }

  async listDishes(query: DishListQuery): Promise<PaginatedResult<DishEntity>> {
    const { restaurantId, menuId, ...pagination } = query;

    if (menuId) {
      return this.dishRepository.paginateByMenu(menuId, pagination);
    }

    if (restaurantId) {
      return this.dishRepository.paginateByRestaurant(restaurantId, pagination);
    }

    return this.dishRepository.paginate(pagination);
  }

  async deleteDish(dishId: string): Promise<void> {
    const deleted = await this.dishRepository.delete(dishId);

    if (!deleted) {
      throw new DishDeletionFailedError(dishId, 'Repository returned false');
    }
  }
}
