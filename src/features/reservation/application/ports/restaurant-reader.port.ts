export const RESTAURANT_RESERVATION_READER = Symbol(
  'RESTAURANT_RESERVATION_READER',
);

export interface RestaurantReservationReaderPort {
  exists(restaurantId: string): Promise<boolean>;
}
