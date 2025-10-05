export class ReviewRestaurantNotFoundError extends Error {
  constructor(public readonly restaurantId: string) {
    super(`Restaurant ${restaurantId} not found`);
    this.name = ReviewRestaurantNotFoundError.name;
  }
}
