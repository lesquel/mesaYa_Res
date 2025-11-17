import type { RestaurantDay } from '../entities/values/restaurant-day';
import type { RestaurantLocationSnapshot } from '../entities/values/restaurant-location';

export interface RestaurantCreateRequest {
  ownerId: string;
  name: string;
  description?: string | null;
  location: RestaurantLocationSnapshot | string;
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

export interface RestaurantUpdateRequest {
  restaurantId: string;
  ownerId: string;
  name?: string;
  description?: string | null;
  location?: RestaurantLocationSnapshot | string;
  openTime?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
  closeTime?: string;
  daysOpen?: RestaurantDay[];
  totalCapacity?: number;
  subscriptionId?: string;
  imageId?: string | null;
}

export interface RestaurantStatusUpdateRequest {
  restaurantId: string;
  ownerId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
}

export interface RestaurantDeleteRequest {
  restaurantId: string;
  ownerId: string;
}
