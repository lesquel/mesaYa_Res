export type GraphicObjectProps = {
  posX: number;
  posY: number;
  width: number;
  height: number;
  imageId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type GraphicObjectSnapshot = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
} & Omit<GraphicObjectProps, 'createdAt' | 'updatedAt'>;
