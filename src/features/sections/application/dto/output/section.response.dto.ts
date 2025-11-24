import type {
  SectionLayoutMetadata,
  SectionStatus,
} from '@features/sections/domain/types';
import { PaginatedResult } from '@shared/application/types/pagination';
import type { TableResponseDto } from '@features/tables/application/dto/output/table.response.dto';

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
  tables?: TableResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedSectionResponse = PaginatedResult<SectionResponseDto>;
