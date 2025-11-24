import { RestaurantEntity } from '../entities/restaurant.entity';

export abstract class IRestaurantDomainRepositoryPort {
  abstract save(restaurant: RestaurantEntity): Promise<RestaurantEntity>;
  abstract findById(restaurantId: string): Promise<RestaurantEntity | null>;
  abstract delete(restaurantId: string): Promise<boolean>;
  abstract assignOwner(
    restaurantId: string,
    ownerId: string,
  ): Promise<RestaurantEntity>;
}
