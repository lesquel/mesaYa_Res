import type { RestaurantDay } from '../entities/values/restaurant-day.js';

export interface RestaurantUpdate {
  id: string;
  name?: string;
  description?: string | null;
  location?: string;
  openTime?: string;
  closeTime?: string;
  daysOpen?: RestaurantDay[];
  totalCapacity?: number;
  subscriptionId?: string;
  imageId?: string | null;
}
