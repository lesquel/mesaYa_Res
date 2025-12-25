import type { SectionObjectProps, SectionObjectSnapshot } from '../types';
import { InvalidSectionObjectDataError } from '../errors';

// Re-export for backward compatibility
export type { SectionObjectProps, SectionObjectSnapshot } from '../types';
export {
  InvalidSectionObjectDataError,
  ObjectNotFoundForSectionObjectError,
  SectionNotFoundForSectionObjectError,
  SectionObjectNotFoundError,
} from '../errors';

export class SectionObject {
  private constructor(
    private _id: string,
    private props: SectionObjectProps,
  ) {}

  static create(id: string, props: SectionObjectProps): SectionObject {
    SectionObject.validate(props);
    const now = new Date();
    return new SectionObject(id, {
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  static validate(props: SectionObjectProps) {
    const uuidLike = (v: unknown) => typeof v === 'string' && v.length >= 8;
    if (!uuidLike(props.sectionId))
      throw new InvalidSectionObjectDataError('sectionId must be a uuid');
    if (!uuidLike(props.objectId))
      throw new InvalidSectionObjectDataError('objectId must be a uuid');
    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt))
      throw new InvalidSectionObjectDataError('createdAt must be a valid Date');
    if (!(props.updatedAt instanceof Date) || Number.isNaN(props.updatedAt))
      throw new InvalidSectionObjectDataError('updatedAt must be a valid Date');
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

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(patch: Partial<SectionObjectProps>) {
    const next = {
      ...this.props,
      ...patch,
      updatedAt: new Date(),
    } as SectionObjectProps;
    SectionObject.validate(next);
    this.props = next;
  }

  snapshot(): { id: string } & SectionObjectProps {
    return { id: this._id, ...this.props };
  }
}
