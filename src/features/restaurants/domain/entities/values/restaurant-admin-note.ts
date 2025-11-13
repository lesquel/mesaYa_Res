import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

export class RestaurantAdminNote {
  private constructor(private readonly internal: string | null) {}

  static create(value: string | null | undefined): RestaurantAdminNote {
    if (value === undefined || value === null) {
      return new RestaurantAdminNote(null);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return new RestaurantAdminNote(null);
    }

    if (normalized.length > 500) {
      throw new InvalidRestaurantDataError(
        'Admin note must be at most 500 characters',
      );
    }

    return new RestaurantAdminNote(normalized);
  }

  get value(): string | null {
    return this.internal;
  }
}
