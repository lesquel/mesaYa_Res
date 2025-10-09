import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error.js';

export class RestaurantImageId {
  private constructor(private readonly internal: number | null) {}

  static create(value: number | null | undefined): RestaurantImageId {
    if (value === undefined || value === null) {
      return new RestaurantImageId(null);
    }

    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidRestaurantDataError(
        'ImageId must be a positive integer when provided',
      );
    }

    return new RestaurantImageId(value);
  }

  get value(): number | null {
    return this.internal;
  }
}
