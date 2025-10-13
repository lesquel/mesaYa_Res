export class BookingRestaurantNotFoundError extends Error {
  constructor(public readonly restaurantId: string) {
    super(`Restaurant ${restaurantId} not found`);
    this.name = BookingRestaurantNotFoundError.name;
  }
}
