import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

export class RestaurantSubscriptionId {
  private readonly internal: string;

  constructor(value: string) {
    if (!value || !value.trim()) {
      throw new InvalidRestaurantDataError(
        'SubscriptionId must be a valid non-empty string',
      );
    }

    this.internal = value;
  }

  get value(): string {
    return this.internal;
  }
}
