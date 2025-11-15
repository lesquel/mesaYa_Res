import type { TableStatus } from '../entities/table.entity';

export interface TableCreateRequest {
  tableId: string;
  sectionId: string;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
  height?: number;
  status?: TableStatus;
  isAvailable?: boolean;
  tableImageId: string;
  chairImageId: string;
}

export interface TableUpdateRequest {
  tableId: string;
  sectionId?: string;
  number?: number;
  capacity?: number;
  posX?: number;
  posY?: number;
  width?: number;
  height?: number;
  status?: TableStatus;
  isAvailable?: boolean;
  tableImageId?: string;
  chairImageId?: string;
}

export interface TableDeleteRequest {
  tableId: string;
}
