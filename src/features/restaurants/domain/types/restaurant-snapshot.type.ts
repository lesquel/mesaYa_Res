import type { RestaurantDay } from '../entities/values/restaurant-day';
import type { RestaurantLocationSnapshot } from '../entities/values/restaurant-location';
import type { SectionWithTablesSnapshot } from '@features/sections/domain/types';

export interface RestaurantSnapshot {
  id: string;
  name: string;
  description: string | null;
  location: RestaurantLocationSnapshot;
  openTime: string;
  closeTime: string;
  daysOpen: RestaurantDay[];
  totalCapacity: number;
  subscriptionId: string;
  imageId: string | null;
  active: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  sections?: SectionWithTablesSnapshot[];
  distanceKm?: number | null;
}
