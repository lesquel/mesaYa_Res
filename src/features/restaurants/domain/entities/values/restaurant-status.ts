import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

export const RESTAURANT_STATUS = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] as const;
export type RestaurantStatusValue = (typeof RESTAURANT_STATUS)[number];

export class RestaurantStatus {
  private constructor(private readonly internal: RestaurantStatusValue) {}

  static create(value?: string | null): RestaurantStatus {
    const normalized = (value ?? 'ACTIVE').toUpperCase();
    if (!RESTAURANT_STATUS.includes(normalized as RestaurantStatusValue)) {
      throw new InvalidRestaurantDataError(
        `Status must be one of: ${RESTAURANT_STATUS.join(', ')}`,
      );
    }

    return new RestaurantStatus(normalized as RestaurantStatusValue);
  }

  get value(): RestaurantStatusValue {
    return this.internal;
  }

  isActive(): boolean {
    return this.internal === 'ACTIVE';
  }

  suspend(): RestaurantStatus {
    return new RestaurantStatus('SUSPENDED');
  }

  archive(): RestaurantStatus {
    return new RestaurantStatus('ARCHIVED');
  }

  activate(): RestaurantStatus {
    return new RestaurantStatus('ACTIVE');
  }
}
