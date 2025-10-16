export type SectionObjectProps = {
  sectionId: string;
  objectId: string;
};

export class InvalidSectionObjectDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSectionObjectDataError';
  }
}

export class SectionObjectNotFoundError extends Error {
  constructor(id: string) {
    super(`SectionObject not found: ${id}`);
    this.name = 'SectionObjectNotFoundError';
  }
}

export class SectionNotFoundForSectionObjectError extends Error {
  constructor(sectionId: string) {
    super(`Section not found for SectionObject: ${sectionId}`);
    this.name = 'SectionNotFoundForSectionObjectError';
  }
}

export class ObjectNotFoundForSectionObjectError extends Error {
  constructor(objectId: string) {
    super(`Object not found for SectionObject: ${objectId}`);
    this.name = 'ObjectNotFoundForSectionObjectError';
  }
}

export class SectionObject {
  private constructor(private _id: string, private props: SectionObjectProps) {}

  static create(id: string, props: SectionObjectProps): SectionObject {
    SectionObject.validate(props);
    return new SectionObject(id, { ...props });
  }

  static validate(props: SectionObjectProps) {
    const uuidLike = (v: unknown) => typeof v === 'string' && v.length >= 8;
    if (!uuidLike(props.sectionId))
      throw new InvalidSectionObjectDataError('sectionId must be a uuid');
    if (!uuidLike(props.objectId))
      throw new InvalidSectionObjectDataError('objectId must be a uuid');
  }

  get id() {
    return this._id;
  }
  get sectionId() {
    return this.props.sectionId;
  }
  get objectId() {
    return this.props.objectId;
  }

  update(patch: Partial<SectionObjectProps>) {
    const next = { ...this.props, ...patch } as SectionObjectProps;
    SectionObject.validate(next);
    this.props = next;
  }

  snapshot(): { id: string } & SectionObjectProps {
    return { id: this._id, ...this.props };
  }
}
