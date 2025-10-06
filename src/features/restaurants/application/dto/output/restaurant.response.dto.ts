import { PaginatedResult } from '@shared/application/interfaces/pagination.js';

export interface RestaurantResponseDto {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  openTime: string;
  closeTime: string;
  daysOpen: string[];
  totalCapacity: number;
  subscriptionId: number;
  imageId?: number | null;
  active: boolean;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedRestaurantResponse =
  PaginatedResult<RestaurantResponseDto>;
