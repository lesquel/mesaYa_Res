import { randomUUID } from 'crypto';
import { InvalidSectionDataError } from '../errors/invalid-section-data.error.js';

export interface SectionProps {
  restaurantId: string;
  name: string;
  description: string | null;
}

export type CreateSectionProps = {
  restaurantId: string;
  name: string;
  description?: string | null;
};

export type UpdateSectionProps = Partial<SectionProps>;

export interface SectionSnapshot extends SectionProps {
  id: string;
}

export class Section {
  private constructor(
    private props: SectionProps,
    private readonly _id: string,
  ) {}

  static create(props: CreateSectionProps, id: string = randomUUID()): Section {
    const normalized: SectionProps = {
      restaurantId: this.normalizeId(props.restaurantId, 'Restaurant'),
      name: this.normalizeName(props.name),
      description: this.normalizeDescription(props.description),
    };

    this.validate(normalized);

    return new Section(normalized, id);
  }

  static rehydrate(snapshot: SectionSnapshot): Section {
    const normalized: SectionProps = {
      restaurantId: this.normalizeId(snapshot.restaurantId, 'Restaurant'),
      name: this.normalizeName(snapshot.name),
      description: this.normalizeDescription(snapshot.description),
    };

    this.validate(normalized);

    return new Section(normalized, snapshot.id);
  }

  get id(): string {
    return this._id;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  update(data: UpdateSectionProps): void {
    const next: SectionProps = {
      restaurantId:
        data.restaurantId !== undefined
          ? Section.normalizeId(data.restaurantId, 'Restaurant')
          : this.props.restaurantId,
      name:
        data.name !== undefined
          ? Section.normalizeName(data.name)
          : this.props.name,
      description:
        data.description !== undefined
          ? Section.normalizeDescription(data.description)
          : this.props.description,
    };

    Section.validate(next);

    this.props = next;
  }

  snapshot(): SectionSnapshot {
    return {
      id: this._id,
      ...this.props,
    };
  }

  private static normalizeId(value: string, label: string): string {
    if (!value || value.trim().length === 0) {
      throw new InvalidSectionDataError(`${label} id is required`);
    }
    return value.trim();
  }

  private static normalizeName(value: string): string {
    if (typeof value !== 'string') {
      throw new InvalidSectionDataError('Name is required');
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new InvalidSectionDataError('Name is required');
    }
    return trimmed;
  }

  private static normalizeDescription(value?: string | null): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private static validate(props: SectionProps): void {
    if (props.name.length > 50) {
      throw new InvalidSectionDataError('Name must be at most 50 characters');
    }

    if (props.description && props.description.length > 1000) {
      throw new InvalidSectionDataError(
        'Description must be at most 1000 characters',
      );
    }
  }
}
