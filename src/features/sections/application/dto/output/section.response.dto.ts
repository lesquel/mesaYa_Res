import type {
  SectionLayoutMetadata,
  SectionStatus,
} from '@features/sections/domain/types';
import { PaginatedResult } from '@shared/application/types/pagination';

export interface SectionResponseDto {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  width: number;
  height: number;
  posX: number;
  posY: number;
  status: SectionStatus;
  layoutMetadata: SectionLayoutMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedSectionResponse = PaginatedResult<SectionResponseDto>;
