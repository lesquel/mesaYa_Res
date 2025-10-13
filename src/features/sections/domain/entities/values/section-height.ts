import { InvalidSectionDataError } from '../../errors/invalid-section-data.error.js';

export class SectionHeight {
  private readonly internal: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidSectionDataError('Height must be a positive integer');
    }

    this.internal = value;
  }

  get value(): number {
    return this.internal;
  }
}
