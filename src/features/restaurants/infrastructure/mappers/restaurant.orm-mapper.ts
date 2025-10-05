import {
  Restaurant,
  type RestaurantDay,
} from '../../domain/entities/restaurant.entity.js';
import { RestaurantOrmEntity } from '../orm/restaurant.orm-entity.js';
import { User } from '../../../../auth/entities/user.entity.js';

export class RestaurantOrmMapper {
  static toDomain(entity: RestaurantOrmEntity): Restaurant {
    return Restaurant.rehydrate({
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      location: entity.location,
      openTime: entity.openTime,
      closeTime: entity.closeTime,
      daysOpen: (entity.daysOpen ?? []) as RestaurantDay[],
      totalCapacity: entity.totalCapacity,
      subscriptionId: entity.subscriptionId,
      imageId: entity.imageId ?? null,
      active: entity.active,
      ownerId: entity.ownerId ?? entity.owner?.id ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrmEntity(
    restaurant: Restaurant,
    owner?: User,
  ): RestaurantOrmEntity {
    const snapshot = restaurant.snapshot();
    const entity = new RestaurantOrmEntity();

    entity.id = snapshot.id;
    entity.name = snapshot.name;
    entity.description = snapshot.description ?? null;
    entity.location = snapshot.location;
    entity.openTime = snapshot.openTime;
    entity.closeTime = snapshot.closeTime;
    entity.daysOpen = snapshot.daysOpen;
    entity.totalCapacity = snapshot.totalCapacity;
    entity.subscriptionId = snapshot.subscriptionId;
    entity.imageId = snapshot.imageId ?? null;
    entity.active = snapshot.active;
    entity.ownerId = snapshot.ownerId ?? null;
    entity.owner = owner ?? null;
    entity.createdAt = snapshot.createdAt;
    entity.updatedAt = snapshot.updatedAt;

    return entity;
  }
}
