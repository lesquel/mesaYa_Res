import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { MenuCategoryCreate, MenuCategoryUpdate } from '../types';
import { MenuCategoryEntity } from '../entities/menu-category.entity';

export abstract class IMenuCategoryRepositoryPort extends IBaseRepositoryPort<
  MenuCategoryEntity,
  MenuCategoryCreate,
  MenuCategoryUpdate
> {
  abstract findByRestaurant(
    restaurantId: string,
  ): Promise<MenuCategoryEntity[]>;
}
