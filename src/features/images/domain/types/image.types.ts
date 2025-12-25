export interface ImageProps {
  url: string;
  storagePath: string;
  title: string;
  description: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateImageProps = Omit<ImageProps, 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateImageProps = Partial<
  Omit<ImageProps, 'createdAt' | 'updatedAt'>
>;

export type ImageSnapshot = ImageProps & { id: string };
