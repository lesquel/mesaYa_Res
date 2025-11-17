import type { RestaurantDay } from '../entities/values/restaurant-day';
import type { RestaurantLocationInput } from '../entities/values/restaurant-location';
import type { SectionWithTablesSnapshot } from '@features/sections/domain/types';

export interface RestaurantCreate {
  name: string;
  description?: string | null;
  location: RestaurantLocationInput;
  openTime: string;
  closeTime: string;
  daysOpen: RestaurantDay[];
  totalCapacity: number;
  subscriptionId: string;
  imageId?: string | null;
  active?: boolean;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
  sections?: SectionWithTablesSnapshot[];
}
