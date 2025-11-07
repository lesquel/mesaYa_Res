export type GraphicObjectProps = {
  posX: number;
  posY: number;
  width: number;
  height: number;
  imageId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class InvalidGraphicObjectDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGraphicObjectDataError';
  }
}

export class GraphicObjectNotFoundError extends Error {
  constructor(id: string) {
    super(`GraphicObject not found: ${id}`);
    this.name = 'GraphicObjectNotFoundError';
  }
}

export class GraphicObject {
  private constructor(
    private _id: string,
    private props: GraphicObjectProps,
  ) {}

  static create(id: string, props: GraphicObjectProps): GraphicObject {
    const normalized = GraphicObject.normalize(props);
    return new GraphicObject(id, normalized);
  }

  static validate(props: GraphicObjectProps) {
    const { posX, posY, width, height, imageId } = props;
    const isInt = (n: unknown) => Number.isInteger(n as number);
    if (!isInt(posX) || !isInt(posY))
      throw new InvalidGraphicObjectDataError('posX/posY must be integers');
    if (!isInt(width) || width <= 0)
      throw new InvalidGraphicObjectDataError('width must be positive integer');
    if (!isInt(height) || height <= 0)
      throw new InvalidGraphicObjectDataError(
        'height must be positive integer',
      );
    if (typeof imageId !== 'string' || imageId.trim().length === 0)
      throw new InvalidGraphicObjectDataError('imageId must be a non-empty string');
  }

  private static normalize(props: GraphicObjectProps): GraphicObjectProps {
    GraphicObject.validate(props);
    return {
      ...props,
      imageId: props.imageId.trim(),
    };
  }

  get id() {
    return this._id;
  }

  get posX() {
    return this.props.posX;
  }
  get posY() {
    return this.props.posY;
  }
  get width() {
    return this.props.width;
  }
  get height() {
    return this.props.height;
  }
  get imageId() {
    return this.props.imageId;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  update(patch: Partial<GraphicObjectProps>) {
    const next = GraphicObject.normalize({ ...this.props, ...patch } as GraphicObjectProps);
    this.props = next;
  }

  snapshot(): {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } & GraphicObjectProps {
    return {
      id: this._id,
      ...this.props,
      createdAt: this.props.createdAt ?? new Date(),
      updatedAt: this.props.updatedAt ?? new Date(),
    };
  }
}
