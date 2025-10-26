import { Section } from '../../../../domain';
import { SectionOrmEntity } from '../orm';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure';

export interface SectionOrmMapperOptions {
  existing?: SectionOrmEntity;
  restaurant?: RestaurantOrmEntity;
}

export class SectionOrmMapper {
  static toDomain(entity: SectionOrmEntity): Section {
    return Section.rehydrate({
      id: entity.id,
      restaurantId: entity.restaurantId ?? entity.restaurant?.id ?? '',
      name: entity.name,
      description: entity.description ?? null,
      width: entity.width,
      height: entity.height,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrmEntity(
    section: Section,
    options: SectionOrmMapperOptions = {},
  ): SectionOrmEntity {
    const snapshot = section.snapshot();
    const entity = options.existing ?? new SectionOrmEntity();

    entity.id = snapshot.id;
    entity.name = snapshot.name;
    entity.description = snapshot.description ?? null;
    entity.width = snapshot.width;
    entity.height = snapshot.height;
    const restaurant = options.restaurant ?? entity.restaurant;
    if (restaurant) {
      entity.restaurant = restaurant;
      entity.restaurantId = restaurant.id;
    }

    return entity;
  }
}
