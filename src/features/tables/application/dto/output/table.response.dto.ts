import { PaginatedResult } from '@shared/application/types/pagination';

export interface TableResponseDto {
  id: string;
  sectionId: string;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
  tableImageId: string;
  chairImageId: string;
}

export type PaginatedTableResponse = PaginatedResult<TableResponseDto>;
