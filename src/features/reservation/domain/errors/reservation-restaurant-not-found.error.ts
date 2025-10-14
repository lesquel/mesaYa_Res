export class ReservationRestaurantNotFoundError extends Error {
  constructor(public readonly restaurantId: string) {
    super(`Restaurant ${restaurantId} not found`);
    this.name = ReservationRestaurantNotFoundError.name;
  }
}
