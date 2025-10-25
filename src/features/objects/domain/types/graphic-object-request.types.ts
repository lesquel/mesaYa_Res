export interface GraphicObjectCreateRequest {
  objectId: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  imageId: string;
}

export interface GraphicObjectUpdateRequest {
  objectId: string;
  posX?: number;
  posY?: number;
  width?: number;
  height?: number;
  imageId?: string;
}

export interface GraphicObjectDeleteRequest {
  objectId: string;
}
