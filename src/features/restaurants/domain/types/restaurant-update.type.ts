import type { RestaurantDay } from '../entities/values/restaurant-day';
import type { RestaurantLocationInput } from '../entities/values/restaurant-location';

export interface RestaurantUpdate {
  id: string;
  name?: string;
  description?: string | null;
  location?: RestaurantLocationInput;
  openTime?: string;
  closeTime?: string;
  daysOpen?: RestaurantDay[];
  totalCapacity?: number;
  subscriptionId?: string;
  imageId?: string | null;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
}
