import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

export class RestaurantCapacity {
  private readonly internal: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidRestaurantDataError(
        'Total capacity must be a positive integer',
      );
    }

    this.internal = value;
  }

  get value(): number {
    return this.internal;
  }
}
