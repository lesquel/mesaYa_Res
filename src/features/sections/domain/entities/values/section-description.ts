import { InvalidSectionDataError } from '../../errors/invalid-section-data.error';

export class SectionDescription {
  private constructor(private readonly internal: string | null) {}

  static create(value: string | null | undefined): SectionDescription {
    if (value === undefined || value === null) {
      return new SectionDescription(null);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return new SectionDescription(null);
    }

    if (normalized.length > 1000) {
      throw new InvalidSectionDataError(
        'Description must be at most 1000 characters',
      );
    }

    return new SectionDescription(normalized);
  }

  get value(): string | null {
    return this.internal;
  }
}
