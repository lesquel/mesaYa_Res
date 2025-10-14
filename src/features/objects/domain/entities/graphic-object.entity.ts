export type GraphicObjectProps = {
  posX: number;
  posY: number;
  width: number;
  height: number;
  imageId: number;
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
  private constructor(private _id: string, private props: GraphicObjectProps) {}

  static create(id: string, props: GraphicObjectProps): GraphicObject {
    GraphicObject.validate(props);
    return new GraphicObject(id, { ...props });
  }

  static validate(props: GraphicObjectProps) {
    const { posX, posY, width, height, imageId } = props;
    const isInt = (n: unknown) => Number.isInteger(n as number);
    if (!isInt(posX) || !isInt(posY)) throw new InvalidGraphicObjectDataError('posX/posY must be integers');
    if (!isInt(width) || width <= 0) throw new InvalidGraphicObjectDataError('width must be positive integer');
    if (!isInt(height) || height <= 0) throw new InvalidGraphicObjectDataError('height must be positive integer');
    if (!isInt(imageId) || imageId <= 0) throw new InvalidGraphicObjectDataError('imageId must be positive integer');
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

  update(patch: Partial<GraphicObjectProps>) {
    const next = { ...this.props, ...patch } as GraphicObjectProps;
    GraphicObject.validate(next);
    this.props = next;
  }

  snapshot(): { id: string } & GraphicObjectProps {
    return { id: this._id, ...this.props };
  }
}
