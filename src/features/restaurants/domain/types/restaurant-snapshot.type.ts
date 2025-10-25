import type { RestaurantDay } from '../entities/values/restaurant-day';

export interface RestaurantSnapshot {
  id: string;
  name: string;
  description: string | null;
  location: string;
  openTime: string;
  closeTime: string;
  daysOpen: RestaurantDay[];
  totalCapacity: number;
  subscriptionId: string;
  imageId: string | null;
  active: boolean;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
