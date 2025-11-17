import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

export interface RestaurantLocationSnapshot {
  label: string;
  address: string;
  city: string;
  province?: string | null;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
}

type RestaurantLocationInput =
  | string
  | (Partial<RestaurantLocationSnapshot> & {
      address?: string;
      city?: string;
      country?: string;
    });

export class RestaurantLocation {
  private readonly props: RestaurantLocationSnapshot;

  constructor(input: RestaurantLocationInput) {
    const normalized = this.normalizeInput(input);
    this.validate(normalized);
    this.props = {
      ...normalized,
      label: normalized.label || this.buildLabel(normalized),
      province: normalized.province ?? null,
      placeId: normalized.placeId ?? null,
      latitude: normalized.latitude ?? null,
      longitude: normalized.longitude ?? null,
    };
  }

  get value(): RestaurantLocationSnapshot {
    return { ...this.props };
  }

  get label(): string {
    return this.props.label;
  }

  private normalizeInput(
    input: RestaurantLocationInput,
  ): RestaurantLocationSnapshot {
    if (typeof input === 'string') {
      const label = input.trim();
      return {
        label,
        address: label,
        city: label,
        country: label,
      };
    }

    const candidate = input ?? {};
    return {
      label: (candidate.label ?? '').trim(),
      address: (candidate.address ?? candidate.label ?? '').trim(),
      city: (candidate.city ?? '').trim(),
      province: (candidate.province ?? '').trim() || null,
      country: (candidate.country ?? '').trim(),
      latitude: this.parseCoordinate(candidate.latitude),
      longitude: this.parseCoordinate(candidate.longitude),
      placeId: (candidate.placeId ?? '').trim() || null,
    };
  }

  private validate(input: RestaurantLocationSnapshot): void {
    if (!input.address) {
      throw new InvalidRestaurantDataError('Location address is required');
    }

    if (input.address.length > 200) {
      throw new InvalidRestaurantDataError(
        'Location address must be at most 200 characters',
      );
    }

    if (input.city && input.city.length > 120) {
      throw new InvalidRestaurantDataError('City must be at most 120 characters');
    }

    if (input.country && input.country.length > 120) {
      throw new InvalidRestaurantDataError('Country must be at most 120 characters');
    }

    this.validateCoordinate(input.latitude, 'latitude');
    this.validateCoordinate(input.longitude, 'longitude');
  }

  private buildLabel(input: RestaurantLocationSnapshot): string {
    return [input.address, input.city, input.province, input.country]
      .filter(Boolean)
      .join(', ')
      .trim();
  }

  private parseCoordinate(value?: number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      return null;
    }

    return value;
  }

  private validateCoordinate(value: number | null, field: 'latitude' | 'longitude'): void {
    if (value === null || value === undefined) {
      return;
    }

    if (!Number.isFinite(value)) {
      throw new InvalidRestaurantDataError(`Invalid ${field} value`);
    }

    if (field === 'latitude' && (value < -90 || value > 90)) {
      throw new InvalidRestaurantDataError('Latitude must be between -90 and 90');
    }

    if (field === 'longitude' && (value < -180 || value > 180)) {
      throw new InvalidRestaurantDataError('Longitude must be between -180 and 180');
    }
  }
}
