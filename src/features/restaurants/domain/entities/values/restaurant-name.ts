import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

export class RestaurantName {
  private readonly internal: string;

  constructor(input: string) {
    const normalized = input?.trim();

    if (!normalized) {
      throw new InvalidRestaurantDataError('Name is required');
    }

    if (normalized.length > 100) {
      throw new InvalidRestaurantDataError(
        'Name must be at most 100 characters',
      );
    }

    this.internal = normalized;
  }

  get value(): string {
    return this.internal;
  }
}
