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

export class InvalidImageDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidImageDataError';
  }
}

export class ImageNotFoundError extends Error {
  constructor(id: string) {
    super(`Image not found: ${id}`);
    this.name = 'ImageNotFoundError';
  }
}

export class Image {
  private constructor(
    private _id: string | null,
    private props: ImageProps,
  ) {}

  static create(props: CreateImageProps, id: string | null = null): Image {
    const now = new Date();
    const normalized = Image.normalize({
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
    return new Image(id, normalized);
  }

  static rehydrate(snapshot: ImageSnapshot): Image {
    return Image.create(
      {
        url: snapshot.url,
        storagePath: snapshot.storagePath,
        title: snapshot.title,
        description: snapshot.description,
        entityId: snapshot.entityId,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      },
      snapshot.id,
    );
  }

  private static normalize(props: ImageProps): ImageProps {
    Image.validate(props);
    return {
      url: props.url.trim(),
      storagePath: props.storagePath.trim(),
      title: props.title.trim(),
      description: props.description.trim(),
      entityId: props.entityId.trim(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  private static validate(props: ImageProps): void {
    if (!props.url || props.url.trim().length === 0)
      throw new InvalidImageDataError('url cannot be empty');
    if (!props.storagePath || props.storagePath.trim().length === 0)
      throw new InvalidImageDataError('storagePath cannot be empty');
    if (!props.title || props.title.trim().length === 0)
      throw new InvalidImageDataError('title cannot be empty');
    if (props.title.trim().length > 20)
      throw new InvalidImageDataError('title must be at most 20 characters');
    if (!props.description || props.description.trim().length === 0)
      throw new InvalidImageDataError('description cannot be empty');
    if (props.description.trim().length > 100)
      throw new InvalidImageDataError(
        'description must be at most 100 characters',
      );
    if (typeof props.entityId !== 'string' || props.entityId.trim().length === 0)
      throw new InvalidImageDataError('entityId must be a non-empty string');
    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt))
      throw new InvalidImageDataError('createdAt must be a valid Date');
    if (!(props.updatedAt instanceof Date) || Number.isNaN(props.updatedAt))
      throw new InvalidImageDataError('updatedAt must be a valid Date');
  }

  get maybeId(): string | null {
    return this._id;
  }

  get id(): string {
    if (this._id === null)
      throw new InvalidImageDataError('Image id has not been assigned yet');
    return this._id;
  }

  get url(): string {
    return this.props.url;
  }

  get storagePath(): string {
    return this.props.storagePath;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get entityId(): string {
    return this.props.entityId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(patch: UpdateImageProps): void {
    const next: ImageProps = {
      ...this.props,
      ...patch,
      createdAt: this.props.createdAt,
      updatedAt: new Date(),
    } as ImageProps;
    this.props = Image.normalize(next);
  }

  snapshot(): ImageSnapshot {
    if (this._id === null)
      throw new InvalidImageDataError('Cannot snapshot image without id');
    return { id: this._id, ...this.props };
  }
}
