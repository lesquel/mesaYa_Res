import { Restaurant, type RestaurantDay } from '../../../../domain/index.js';
import { RestaurantOrmEntity } from '../orm/index.js';
import { UserOrmEntity } from '../../../../../../auth/entities/user.entity.js';

export class RestaurantOrmMapper {
  static toDomain(entity: RestaurantOrmEntity): Restaurant {
    const normalizeTime = (value: string | null | undefined): string => {
      if (!value) {
        return '00:00';
      }

      if (/^\d{2}:\d{2}$/.test(value)) {
        return value;
      }

      if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
        return value.slice(0, 5);
      }

      return value;
    };

    return Restaurant.rehydrate({
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      location: entity.location,
      openTime: normalizeTime(entity.openTime),
      closeTime: normalizeTime(entity.closeTime),
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
    owner?: UserOrmEntity,
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
