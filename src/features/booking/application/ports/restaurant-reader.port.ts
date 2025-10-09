export const RESTAURANT_BOOKING_READER = Symbol('RESTAURANT_BOOKING_READER');

export interface RestaurantBookingReaderPort {
  exists(restaurantId: string): Promise<boolean>;
}
