import { RestaurantEntity } from '../../domain/index';
import { RestaurantResponseDto } from '../dto/index';

export class RestaurantMapper {
  static toResponse(
    restaurant: RestaurantEntity,
    extras?: { distanceKm?: number },
  ): RestaurantResponseDto {
    const snapshot = restaurant.snapshot();
    const location = snapshot.location;
    return {
      id: snapshot.id,
      name: snapshot.name,
      description: snapshot.description,
      location: {
        label: location.label,
        address: location.address,
        city: location.city,
        province: location.province ?? null,
        country: location.country,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        placeId: location.placeId ?? null,
      },
      openTime: snapshot.openTime,
      closeTime: snapshot.closeTime,
      daysOpen: [...snapshot.daysOpen],
      totalCapacity: snapshot.totalCapacity,
      subscriptionId: snapshot.subscriptionId,
      imageId: snapshot.imageId,
      status: snapshot.status,
      adminNote: snapshot.adminNote,
      active: snapshot.active,
      ownerId: snapshot.ownerId,
      distanceKm: extras?.distanceKm,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      sections:
        snapshot.sections?.map((section) => ({
          ...section,
          tables: section.tables ?? [],
        })) ?? [],
    };
  }
}
