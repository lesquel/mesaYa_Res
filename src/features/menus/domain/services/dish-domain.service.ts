import { IDishRepositoryPort } from '../repositories/dish-repository.port';
import { DishEntity } from '../entities/dish.entity';
import { DishCreate, DishUpdate } from '../types';
import {
  DishNotFoundError,
  DishCreationFailedError,
  DishUpdateFailedError,
  DishDeletionFailedError,
} from '../errors';

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

  async updatePlatillo(data: DishUpdate): Promise<DishEntity> {
    const updated = await this.dishRepository.update(data);

    if (!updated) {
      throw new DishUpdateFailedError(data.dishId, 'Repository returned null');
    }

    return updated;
  }

  async findPlatilloById(dishId: string): Promise<DishEntity> {
    const dish = await this.dishRepository.findById(dishId);

    if (!dish) {
      throw new DishNotFoundError(dishId);
    }

    return dish;
  }

  async findAllPlatillos(): Promise<DishEntity[]> {
    return this.dishRepository.findAll();
  }

  async deletePlatillo(dishId: string): Promise<void> {
    const deleted = await this.dishRepository.delete(dishId);

    if (!deleted) {
      throw new DishDeletionFailedError(dishId, 'Repository returned false');
    }
  }
}
