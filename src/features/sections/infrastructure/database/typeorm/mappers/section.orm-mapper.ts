import { Section } from '../../../../domain/index.js';
import { SectionOrmEntity } from '../orm/index.js';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure/index.js';

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
    const restaurant = options.restaurant ?? entity.restaurant;
    if (restaurant) {
      entity.restaurant = restaurant;
      entity.restaurantId = restaurant.id;
    }

    return entity;
  }
}
