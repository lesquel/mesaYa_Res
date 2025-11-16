import type { RestaurantDay } from '../entities/values/restaurant-day';
import type { RestaurantLocationSnapshot } from '../entities/values/restaurant-location';

export interface RestaurantUpdate {
  id: string;
  name?: string;
  description?: string | null;
  location?: RestaurantLocationSnapshot | string;
  openTime?: string;
  closeTime?: string;
  daysOpen?: RestaurantDay[];
  totalCapacity?: number;
  subscriptionId?: string;
  imageId?: string | null;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
}
