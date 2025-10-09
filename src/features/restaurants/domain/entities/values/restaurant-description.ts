import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error.js';

export class RestaurantDescription {
  private constructor(private readonly internal: string | null) {}

  static create(value: string | null | undefined): RestaurantDescription {
    if (value === undefined || value === null) {
      return new RestaurantDescription(null);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return new RestaurantDescription(null);
    }

    if (normalized.length > 1000) {
      throw new InvalidRestaurantDataError(
        'Description must be at most 1000 characters',
      );
    }

    return new RestaurantDescription(normalized);
  }

  get value(): string | null {
    return this.internal;
  }
}
