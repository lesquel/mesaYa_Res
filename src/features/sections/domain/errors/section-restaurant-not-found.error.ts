export class SectionRestaurantNotFoundError extends Error {
  constructor(public readonly restaurantId: string) {
    super(`Restaurant ${restaurantId} not found`);
    this.name = SectionRestaurantNotFoundError.name;
  }
}
