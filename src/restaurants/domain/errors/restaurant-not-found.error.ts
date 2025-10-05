export class RestaurantNotFoundError extends Error {
  constructor(public readonly restaurantId: string) {
    super(`Restaurant ${restaurantId} not found`);
    this.name = RestaurantNotFoundError.name;
  }
}
