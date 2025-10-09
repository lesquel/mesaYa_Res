import { PaginatedResult } from '@shared/application/types/pagination.js';

export interface SectionResponseDto {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  width: number;
  height: number;
}

export type PaginatedSectionResponse = PaginatedResult<SectionResponseDto>;
