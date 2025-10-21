import type { RestaurantDay } from '../entities/values/restaurant-day';

export interface RestaurantCreateRequest {
  ownerId: string;
  name: string;
  description?: string | null;
  location: string;
  openTime: string;
  closeTime: string;
  daysOpen: RestaurantDay[];
  totalCapacity: number;
  subscriptionId: number;
  imageId?: number | null;
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
  subscriptionId?: number;
  imageId?: number | null;
}

export interface RestaurantDeleteRequest {
  restaurantId: string;
  ownerId: string;
}
