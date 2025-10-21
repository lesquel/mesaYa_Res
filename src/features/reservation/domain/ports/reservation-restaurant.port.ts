import type { RestaurantDay } from '@features/restaurants/domain/entities/values/restaurant-day';

export interface ReservationRestaurantSnapshot {
  restaurantId: string;
  openTime: string;
  closeTime: string;
  daysOpen: RestaurantDay[];
  active: boolean;
}

export abstract class IReservationRestaurantPort {
  abstract loadById(
    restaurantId: string,
  ): Promise<ReservationRestaurantSnapshot | null>;
}
