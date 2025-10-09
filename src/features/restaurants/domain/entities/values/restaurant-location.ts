import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error.js';

export class RestaurantLocation {
  private readonly internal: string;

  constructor(input: string) {
    const normalized = input?.trim();

    if (!normalized) {
      throw new InvalidRestaurantDataError('Location is required');
    }

    if (normalized.length > 200) {
      throw new InvalidRestaurantDataError(
        'Location must be at most 200 characters',
      );
    }

    this.internal = normalized;
  }

  get value(): string {
    return this.internal;
  }
}
