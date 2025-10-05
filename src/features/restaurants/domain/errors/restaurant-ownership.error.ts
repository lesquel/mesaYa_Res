export class RestaurantOwnershipError extends Error {
  constructor() {
    super('You can only operate on restaurants that you own');
    this.name = RestaurantOwnershipError.name;
  }
}
