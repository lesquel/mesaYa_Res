import { InvalidSectionDataError } from '../../errors/invalid-section-data.error.js';

export class SectionName {
  private readonly internal: string;

  constructor(value: string) {
    if (typeof value !== 'string') {
      throw new InvalidSectionDataError('Name is required');
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new InvalidSectionDataError('Name is required');
    }

    if (normalized.length > 50) {
      throw new InvalidSectionDataError('Name must be at most 50 characters');
    }

    this.internal = normalized;
  }

  get value(): string {
    return this.internal;
  }
}
