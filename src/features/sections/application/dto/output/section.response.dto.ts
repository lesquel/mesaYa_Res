import { PaginatedResult } from '@shared/application/interfaces/pagination.js';

export interface SectionResponseDto {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
}

export type PaginatedSectionResponse = PaginatedResult<SectionResponseDto>;
