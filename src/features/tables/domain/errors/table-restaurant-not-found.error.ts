export class TableRestaurantNotFoundError extends Error {
  constructor(restaurantId: string) {
    super(`Restaurant with id '${restaurantId}' was not found`);
    this.name = TableRestaurantNotFoundError.name;
  }
}
