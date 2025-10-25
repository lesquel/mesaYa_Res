import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

export class RestaurantImageId {
  private constructor(private readonly internal: string | null) {}

  static create(value: string | null | undefined): RestaurantImageId {
    if (value === undefined || value === null) {
      return new RestaurantImageId(null);
    }

    if (!value.trim()) {
      throw new InvalidRestaurantDataError(
        'ImageId must be a valid non-empty string when provided',
      );
    }

    return new RestaurantImageId(value);
  }

  get value(): string | null {
    return this.internal;
  }
}
