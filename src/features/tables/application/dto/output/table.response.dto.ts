import type { TableStatus } from '@features/tables/domain/entities/table.entity';
import { PaginatedResult } from '@shared/application/types';

export interface TableResponseDto {
  id: string;
  sectionId: string;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
  height: number;
  tableImageId: string;
  chairImageId: string;
  status: TableStatus;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedTableResponse = PaginatedResult<TableResponseDto>;
