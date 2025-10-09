import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error.js';

export class RestaurantSubscriptionId {
  private readonly internal: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidRestaurantDataError(
        'SubscriptionId must be a positive integer',
      );
    }

    this.internal = value;
  }

  get value(): number {
    return this.internal;
  }
}
