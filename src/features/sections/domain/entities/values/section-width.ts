import { InvalidSectionDataError } from '../../errors/invalid-section-data.error.js';

export class SectionWidth {
  private readonly internal: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidSectionDataError('Width must be a positive integer');
    }

    this.internal = value;
  }

  get value(): number {
    return this.internal;
  }
}
