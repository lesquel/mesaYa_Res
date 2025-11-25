import { MoneyVO } from '@shared/domain/entities/values';
import { MenuCreate, MenuEntity, MenuUpdate } from '@features/menus/domain';
import { MenuOrmEntity, DishOrmEntity } from '../orm';
import { DishOrmMapper } from './dish.orm-mapper';

export class MenuOrmMapper {
  static toDomain(
    menu: MenuOrmEntity,
    dishes: DishOrmEntity[] = [],
  ): MenuEntity {
    const dishSnapshots = dishes.map((dish) =>
      DishOrmMapper.toDomain(dish).snapshot(),
    );

    return MenuEntity.rehydrate({
      menuId: menu.id,
      restaurantId: menu.restaurantId,
      name: menu.name,
      description: menu.description,
      price: new MoneyVO(Number(menu.price)),
      imageId: menu.imageId,
      dishes: dishSnapshots.length > 0 ? dishSnapshots : undefined,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    });
  }

  static fromCreate(data: MenuCreate): MenuOrmEntity {
    const entity = new MenuOrmEntity();
    entity.restaurantId = data.restaurantId;
    entity.name = data.name;
    entity.description = data.description;
    entity.price = data.price.amount;
    entity.imageId = data.imageId;
    return entity;
  }

  static applyUpdate(entity: MenuOrmEntity, data: MenuUpdate): MenuOrmEntity {
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
      entity.imageId = data.imageId;
    }

    return entity;
  }
}
