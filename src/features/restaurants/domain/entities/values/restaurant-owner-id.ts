import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error.js';

export class RestaurantOwnerId {
  private constructor(private readonly internal: string) {}

  static create(value: string): RestaurantOwnerId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new InvalidRestaurantDataError('OwnerId is required');
    }

    return new RestaurantOwnerId(normalized);
  }

  static fromNullable(value: string | null | undefined): RestaurantOwnerId | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new InvalidRestaurantDataError('OwnerId must be a non-empty string');
    }

    return new RestaurantOwnerId(normalized);
  }

  get value(): string {
    return this.internal;
  }
}
