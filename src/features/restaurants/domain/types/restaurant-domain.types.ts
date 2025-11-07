import type { RestaurantDay } from '../entities/values/restaurant-day.js';

export interface RestaurantCreateRequest {
  ownerId: string;
  name: string;
  description?: string | null;
  location: string;
  openTime: string;
  closeTime: string;
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
  location?: string;
  openTime?: string;
  closeTime?: string;
  daysOpen?: RestaurantDay[];
  totalCapacity?: number;
  subscriptionId?: string;
  imageId?: string | null;
}

export interface RestaurantDeleteRequest {
  restaurantId: string;
  ownerId: string;
}
