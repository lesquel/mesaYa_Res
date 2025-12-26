import type { RestaurantDay } from '../entities/values/restaurant-day';
import type { RestaurantLocationInput } from '../entities/values/restaurant-location';

export interface RestaurantUpdateRequest {
  restaurantId: string;
  ownerId: string;
  enforceOwnership?: boolean;
  name?: string;
  description?: string | null;
  location?: RestaurantLocationInput;
  openTime?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
  closeTime?: string;
  daysOpen?: RestaurantDay[];
  totalCapacity?: number;
  subscriptionId?: string;
  imageId?: string | null;
}
