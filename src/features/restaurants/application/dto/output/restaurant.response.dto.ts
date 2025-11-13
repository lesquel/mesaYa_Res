import { PaginatedResult } from '@shared/application/types/pagination';

export interface RestaurantResponseDto {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  openTime: string;
  closeTime: string;
  daysOpen: string[];
  totalCapacity: number;
  subscriptionId: string;
  imageId?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
  active: boolean;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedRestaurantResponse =
  PaginatedResult<RestaurantResponseDto>;
