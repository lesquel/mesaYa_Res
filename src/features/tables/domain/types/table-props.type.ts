import { TableStatus } from './table-status.type';

/**
 * Propiedades de una mesa.
 */
export interface TableProps {
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
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Snapshot de una mesa (para persistencia/rehidratación).
 */
export interface TableSnapshot extends TableProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Propiedades para crear una mesa.
 */
export interface CreateTableProps {
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

/**
 * Propiedades para actualizar una mesa.
 */
export type UpdateTableProps = Partial<
  Omit<TableProps, 'createdAt' | 'updatedAt'>
>;
