import { MoneyVO } from '@shared/domain/entities/values';
import { DishCreate, DishEntity, DishUpdate } from '@features/menus/domain';
import { DishOrmEntity } from '../orm';

export class DishOrmMapper {
  static toDomain(entity: DishOrmEntity): DishEntity {
    return DishEntity.rehydrate({
      dishId: entity.id,
      restaurantId: entity.restaurantId,
      name: entity.name,
      description: entity.description,
      price: new MoneyVO(Number(entity.price)),
      imageId: entity.imageId ?? undefined,
      menuId: entity.menuId ?? undefined,
      categoryId: entity.categoryId ?? undefined,
      categoryName: entity.categoryName ?? undefined,
      categoryDescription: entity.categoryDescription ?? undefined,
      categoryOrder: entity.categoryOrder ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromCreate(data: DishCreate, menuId?: string | null): DishOrmEntity {
    const entity = new DishOrmEntity();
    entity.restaurantId = data.restaurantId;
    entity.name = data.name;
    entity.description = data.description;
    entity.price = data.price.amount;
    entity.imageId = data.imageId ?? null;
    entity.menuId = data.menuId ?? menuId ?? null;
    entity.categoryId = data.categoryId ?? null;
    entity.categoryName = data.categoryName ?? null;
    entity.categoryDescription = data.categoryDescription ?? null;
    entity.categoryOrder = data.categoryOrder ?? null;
    return entity;
  }

  static applyUpdate(entity: DishOrmEntity, data: DishUpdate): DishOrmEntity {
    if (data.name !== undefined) {
      entity.name = data.name;
    }

    if (data.description !== undefined) {
      entity.description = data.description;
    }

    if (data.price !== undefined) {
      entity.price = data.price.amount;
    }

    if (data.imageId !== undefined) {
      entity.imageId = data.imageId ?? null;
    }

    if (data.menuId !== undefined) {
      entity.menuId = data.menuId ?? null;
    }

    if (data.categoryId !== undefined) {
      entity.categoryId = data.categoryId ?? null;
    }

    if (data.categoryName !== undefined) {
      entity.categoryName = data.categoryName ?? null;
    }

    if (data.categoryDescription !== undefined) {
      entity.categoryDescription = data.categoryDescription ?? null;
    }

    if (data.categoryOrder !== undefined) {
      entity.categoryOrder = data.categoryOrder ?? null;
    }

    return entity;
  }
}
