import type { RestaurantDay } from '../entities/values/restaurant-day.js';

export interface RestaurantCreate {
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
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
