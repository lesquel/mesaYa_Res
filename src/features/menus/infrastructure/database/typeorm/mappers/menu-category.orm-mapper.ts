import {
  MenuCategoryCreate,
  MenuCategoryEntity,
  MenuCategoryUpdate,
} from '@features/menus/domain';
import { MenuCategoryOrmEntity } from '../orm';

export class MenuCategoryOrmMapper {
  static toDomain(entity: MenuCategoryOrmEntity): MenuCategoryEntity {
    return MenuCategoryEntity.rehydrate({
      categoryId: entity.id,
      restaurantId: entity.restaurantId,
      name: entity.name,
      description: entity.description ?? null,
      icon: entity.icon ?? null,
      position: entity.position ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromCreate(data: MenuCategoryCreate): MenuCategoryOrmEntity {
    const entity = new MenuCategoryOrmEntity();
    entity.restaurantId = data.restaurantId;
    entity.name = data.name;
    entity.description = data.description ?? null;
    entity.icon = data.icon ?? null;
    entity.position = data.position ?? null;
    entity.isActive = data.isActive ?? true;
    return entity;
  }

  static applyUpdate(
    entity: MenuCategoryOrmEntity,
    update: MenuCategoryUpdate,
  ): MenuCategoryOrmEntity {
    if (update.name !== undefined) {
      entity.name = update.name;
    }

    if (update.description !== undefined) {
      entity.description = update.description;
    }

    if (update.icon !== undefined) {
      entity.icon = update.icon;
    }

    if (update.position !== undefined) {
      entity.position = update.position;
    }

    if (update.isActive !== undefined) {
      entity.isActive = update.isActive;
    }

    return entity;
  }
}
