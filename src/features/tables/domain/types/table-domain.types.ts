export interface TableCreateRequest {
  tableId: string;
  sectionId: string;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
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
  tableImageId?: number;
  chairImageId?: number;
}

export interface TableDeleteRequest {
  tableId: string;
}
