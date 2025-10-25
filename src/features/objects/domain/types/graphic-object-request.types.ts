export interface GraphicObjectCreateRequest {
  objectId: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  imageId: number;
}

export interface GraphicObjectUpdateRequest {
  objectId: string;
  posX?: number;
  posY?: number;
  width?: number;
  height?: number;
  imageId?: number;
}

export interface GraphicObjectDeleteRequest {
  objectId: string;
}
