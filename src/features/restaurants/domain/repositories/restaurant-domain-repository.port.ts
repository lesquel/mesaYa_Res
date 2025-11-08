import { RestaurantEntity } from '../entities/restaurant.entity.js';

export abstract class IRestaurantDomainRepositoryPort {
  abstract save(restaurant: RestaurantEntity): Promise<RestaurantEntity>;
  abstract findById(restaurantId: string): Promise<RestaurantEntity | null>;
  abstract delete(restaurantId: string): Promise<boolean>;
}
