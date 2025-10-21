import { MoneyVO } from '@shared/domain/entities/values';
import { DishCreate, DishEntity, DishUpdate } from '@features/menus/domain';
import { DishOrmEntity } from '../orm/index';

export class DishOrmMapper {
  static toDomain(entity: DishOrmEntity): DishEntity {
    return DishEntity.rehydrate({
      dishId: entity.id,
      restaurantId: entity.restaurantId,
      name: entity.name,
      description: entity.description,
      price: new MoneyVO(Number(entity.price)),
      imageId: entity.imageId ?? undefined,
    });
  }

  static fromCreate(data: DishCreate, menuId?: string | null): DishOrmEntity {
    const entity = new DishOrmEntity();
    entity.restaurantId = data.restaurantId;
    entity.name = data.name;
    entity.description = data.description;
    entity.price = data.price.amount;
    entity.imageId = data.imageId ?? null;
    entity.menuId = menuId ?? null;
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

    return entity;
  }
}
