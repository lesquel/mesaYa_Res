import type { RestaurantDay } from '../entities/values/restaurant-day';

export interface RestaurantUpdate {
  name?: string;
  description?: string | null;
  location?: string;
  openTime?: string;
  closeTime?: string;
  daysOpen?: RestaurantDay[];
  totalCapacity?: number;
  subscriptionId?: number;
  imageId?: number | null;
}
