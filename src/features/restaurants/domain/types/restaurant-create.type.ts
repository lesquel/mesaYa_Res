import type { RestaurantDay } from '../entities/values/restaurant-day';

export interface RestaurantCreate {
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
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
