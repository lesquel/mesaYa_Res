import { InvalidSectionDataError } from '../../errors/invalid-section-data.error';

export class SectionRestaurantId {
  private readonly internal: string;

  constructor(value: string) {
    const normalized = value?.trim();

    if (!normalized) {
      throw new InvalidSectionDataError('Restaurant id is required');
    }

    this.internal = normalized;
  }

  get value(): string {
    return this.internal;
  }
}
