import type { TableStatus } from './table-status.type';

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
