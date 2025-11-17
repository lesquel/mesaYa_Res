import { RestaurantEntity, type RestaurantDay } from '../../../../domain';
import { RestaurantOrmEntity } from '../orm';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import type { RestaurantLocationSnapshot } from '../../../../domain/entities/values/restaurant-location';

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

    const locationSnapshot = RestaurantOrmMapper.buildLocationSnapshot(entity);

    return RestaurantEntity.rehydrate({
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      location: locationSnapshot,
      openTime: normalizeTime(entity.openTime),
      closeTime: normalizeTime(entity.closeTime),
      daysOpen: (entity.daysOpen ?? []) as RestaurantDay[],
      totalCapacity: entity.totalCapacity,
      subscriptionId: entity.subscriptionId,
      imageId: entity.imageId ?? null,
      active: entity.active,
      status: (entity.status ?? (entity.active ? 'ACTIVE' : 'SUSPENDED')) as
        | 'ACTIVE'
        | 'SUSPENDED'
        | 'ARCHIVED',
      adminNote: entity.adminNote ?? null,
      ownerId: entity.ownerId ?? entity.owner?.id ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      sections: (entity.sections ?? []).map((section) => ({
        id: section.id,
        restaurantId: section.restaurantId ?? entity.id,
        name: section.name,
        description: section.description ?? null,
        width: section.width,
        height: section.height,
        posX: 0,
        posY: 0,
        status: 'ACTIVE',
        layoutMetadata: {
          layoutId: null,
          orientation: 'LANDSCAPE',
          zIndex: 0,
          notes: null,
        },
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
        tables: (section.tables ?? []).map((table) => ({
          id: table.id,
          sectionId: table.sectionId,
          number: table.number,
          capacity: table.capacity,
          posX: table.posX,
          posY: table.posY,
          width: table.width,
          height: table.width,
          status: 'AVAILABLE',
          isAvailable: true,
          tableImageId: table.tableImageId,
          chairImageId: table.chairImageId,
          createdAt: table.createdAt,
          updatedAt: table.updatedAt,
        })),
      })),
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
    entity.location = snapshot.location.label || snapshot.location.address;
    entity.locationPayload = {
      label: snapshot.location.label,
      address: snapshot.location.address,
      city: snapshot.location.city,
      province: snapshot.location.province ?? null,
      country: snapshot.location.country,
      latitude: snapshot.location.latitude ?? null,
      longitude: snapshot.location.longitude ?? null,
      placeId: snapshot.location.placeId ?? null,
    } satisfies RestaurantLocationSnapshot;
    entity.locationLatitude = snapshot.location.latitude ?? null;
    entity.locationLongitude = snapshot.location.longitude ?? null;
    entity.openTime = snapshot.openTime;
    entity.closeTime = snapshot.closeTime;
    entity.daysOpen = snapshot.daysOpen;
    entity.totalCapacity = snapshot.totalCapacity;
    entity.subscriptionId = snapshot.subscriptionId;
    entity.imageId = snapshot.imageId ?? null;
    entity.active = snapshot.active;
    entity.status = snapshot.status;
    entity.adminNote = snapshot.adminNote ?? null;
    entity.ownerId = snapshot.ownerId ?? null;
    entity.owner = owner ?? null;
    entity.createdAt = snapshot.createdAt;
    entity.updatedAt = snapshot.updatedAt;

    return entity;
  }

  private static buildLocationSnapshot(
    entity: RestaurantOrmEntity,
  ): RestaurantLocationSnapshot {
    const payload = entity.locationPayload ?? undefined;
    const baseLabel = entity.location ?? payload?.label ?? '';
    return {
      label: payload?.label || baseLabel,
      address: payload?.address || baseLabel,
      city: payload?.city || baseLabel,
      province: payload?.province ?? null,
      country: payload?.country || payload?.province || baseLabel,
      latitude: payload?.latitude ?? entity.locationLatitude ?? null,
      longitude: payload?.longitude ?? entity.locationLongitude ?? null,
      placeId: payload?.placeId ?? null,
    };
  }
}
