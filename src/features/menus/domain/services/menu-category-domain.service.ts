import { IMenuCategoryRepositoryPort } from '../repositories';
import {
  MenuCategoryCreationFailedError,
  MenuCategoryDeletionFailedError,
  MenuCategoryNotFoundError,
  MenuCategoryUpdateFailedError,
} from '../errors';
import { MenuCategoryCreate, MenuCategoryUpdate } from '../types';
import { MenuCategoryEntity } from '../entities/menu-category.entity';

export class MenuCategoryDomainService {
  constructor(private readonly repository: IMenuCategoryRepositoryPort) {}

  async createCategory(data: MenuCategoryCreate): Promise<MenuCategoryEntity> {
    const category = await this.repository.create(data);

    if (!category) {
      throw new MenuCategoryCreationFailedError(data.restaurantId);
    }

    return category;
  }

  async updateCategory(
    update: MenuCategoryUpdate,
  ): Promise<MenuCategoryEntity> {
    const category = await this.repository.update(update);

    if (!category) {
      throw new MenuCategoryUpdateFailedError(update.categoryId);
    }

    return category;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const deleted = await this.repository.delete(categoryId);

    if (!deleted) {
      throw new MenuCategoryDeletionFailedError(categoryId);
    }
  }

  async findById(categoryId: string): Promise<MenuCategoryEntity> {
    const category = await this.repository.findById(categoryId);

    if (!category) {
      throw new MenuCategoryNotFoundError(categoryId);
    }

    return category;
  }

  async findByRestaurant(restaurantId: string): Promise<MenuCategoryEntity[]> {
    return this.repository.findByRestaurant(restaurantId);
  }
}
