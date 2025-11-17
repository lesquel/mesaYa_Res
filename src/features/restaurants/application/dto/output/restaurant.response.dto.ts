import { PaginatedResult } from '@shared/application/types/pagination';
import type { SectionResponseDto } from '@features/sections/application/dto/output';
import type { TableResponseDto } from '@features/tables/application/dto/output';

export interface RestaurantSectionWithTablesDto extends SectionResponseDto {
  tables: TableResponseDto[];
}

export interface RestaurantLocationResponseDto {
  label: string;
  address: string;
  city: string;
  province?: string | null;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
}

export interface RestaurantResponseDto {
  id: string;
  name: string;
  description?: string | null;
  location: RestaurantLocationResponseDto;
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
  distanceKm?: number;
  createdAt: Date;
  updatedAt: Date;
  sections: RestaurantSectionWithTablesDto[];
}

export type PaginatedRestaurantResponse =
  PaginatedResult<RestaurantResponseDto>;
