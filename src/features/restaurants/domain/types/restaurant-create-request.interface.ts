import type { RestaurantDay } from '../entities/values/restaurant-day';
import type { RestaurantLocationInput } from '../entities/values/restaurant-location';

export interface RestaurantCreateRequest {
  ownerId: string;
  name: string;
  description?: string | null;
  location: RestaurantLocationInput;
  openTime: string;
  closeTime: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
  daysOpen: RestaurantDay[];
  totalCapacity: number;
  subscriptionId: string;
  imageId?: string | null;
  active?: boolean;
}
