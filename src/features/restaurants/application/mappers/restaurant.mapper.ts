import { RestaurantEntity } from '../../domain/index';
import { RestaurantResponseDto } from '../dto/index';

export class RestaurantMapper {
  static toResponse(restaurant: RestaurantEntity): RestaurantResponseDto {
    const snapshot = restaurant.snapshot();
    return {
      id: snapshot.id,
      name: snapshot.name,
      description: snapshot.description,
      location: snapshot.location,
      openTime: snapshot.openTime,
      closeTime: snapshot.closeTime,
      daysOpen: [...snapshot.daysOpen],
      totalCapacity: snapshot.totalCapacity,
      subscriptionId: snapshot.subscriptionId,
      imageId: snapshot.imageId,
      active: snapshot.active,
      ownerId: snapshot.ownerId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
