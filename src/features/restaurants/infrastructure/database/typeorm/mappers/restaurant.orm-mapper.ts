import { RestaurantEntity, type RestaurantDay } from '../../../../domain';
import { RestaurantOrmEntity } from '../orm';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';

export class RestaurantOrmMapper {
  static toDomain(entity: RestaurantOrmEntity): RestaurantEntity {
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

    return RestaurantEntity.rehydrate({
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
    restaurant: RestaurantEntity,
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
