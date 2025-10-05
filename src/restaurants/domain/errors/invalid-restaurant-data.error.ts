export class InvalidRestaurantDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = InvalidRestaurantDataError.name;
  }
}
