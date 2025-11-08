import { randomUUID } from 'node:crypto';
import { InvalidRestaurantDataError } from '../errors/invalid-restaurant-data.error.js';

export type RestaurantDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface RestaurantProps {
  name: string;
  description?: string | null;
  location: string;
  openTime: string;
  closeTime: string;
  daysOpen: RestaurantDay[];
  totalCapacity: number;
  subscriptionId: number;
  imageId?: number | null;
  active: boolean;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRestaurantProps = Omit<
  RestaurantProps,
  'active' | 'createdAt' | 'updatedAt' | 'ownerId'
> & {
  ownerId: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateRestaurantProps = Partial<
  Omit<RestaurantProps, 'createdAt' | 'updatedAt' | 'ownerId'>
>;

export interface RestaurantSnapshot extends RestaurantProps {
  id: string;
}

const TIME_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

export class Restaurant {
  private constructor(
    private props: RestaurantProps,
    private readonly _id: string,
  ) {}

  static create(
    props: CreateRestaurantProps,
    id: string = randomUUID(),
  ): Restaurant {
    const now = new Date();
    const fullProps: RestaurantProps = {
      ...props,
      description: props.description ?? null,
      daysOpen: props.daysOpen ?? [],
      imageId: props.imageId ?? null,
      active: props.active ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    };

    this.validate(fullProps);

    return new Restaurant(fullProps, id);
  }

  static rehydrate(snapshot: RestaurantSnapshot): Restaurant {
    this.validate(snapshot, { allowMissingOwner: true });
    return new Restaurant({ ...snapshot }, snapshot.id);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get location(): string {
    return this.props.location;
  }

  get openTime(): string {
    return this.props.openTime;
  }

  get closeTime(): string {
    return this.props.closeTime;
  }

  get daysOpen(): RestaurantDay[] {
    return [...this.props.daysOpen];
  }

  get totalCapacity(): number {
    return this.props.totalCapacity;
  }

  get subscriptionId(): number {
    return this.props.subscriptionId;
  }

  get imageId(): number | null | undefined {
    return this.props.imageId;
  }

  get active(): boolean {
    return this.props.active;
  }

  get ownerId(): string | null {
    return this.props.ownerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(data: UpdateRestaurantProps): void {
    const nextProps: RestaurantProps = {
      ...this.props,
      ...data,
      description: data.description ?? this.props.description,
      imageId:
        data.imageId !== undefined
          ? data.imageId
          : (this.props.imageId ?? null),
      daysOpen: data.daysOpen ?? this.props.daysOpen,
      updatedAt: new Date(),
    };

    Restaurant.validate(nextProps);

    this.props = nextProps;
  }

  deactivate(): void {
    if (!this.props.active) return;
    this.props = {
      ...this.props,
      active: false,
      updatedAt: new Date(),
    };
  }

  activate(): void {
    if (this.props.active) return;
    this.props = {
      ...this.props,
      active: true,
      updatedAt: new Date(),
    };
  }

  transferOwnership(newOwnerId: string): void {
    if (!newOwnerId || newOwnerId.trim().length === 0) {
      throw new InvalidRestaurantDataError(
        'OwnerId must be a non-empty string',
      );
    }
    this.props = {
      ...this.props,
      ownerId: newOwnerId,
      updatedAt: new Date(),
    };
  }

  snapshot(): RestaurantSnapshot {
    return {
      id: this._id,
      ...this.props,
      daysOpen: [...this.props.daysOpen],
    };
  }

  private static validate(
    props: RestaurantProps | RestaurantSnapshot,
    options: { allowMissingOwner?: boolean } = {},
  ): void {
    const { allowMissingOwner = false } = options;
    if (!props.name || props.name.trim().length === 0)
      throw new InvalidRestaurantDataError('Name is required');
    if (props.name.length > 100)
      throw new InvalidRestaurantDataError(
        'Name must be at most 100 characters',
      );
    if (!props.location || props.location.trim().length === 0)
      throw new InvalidRestaurantDataError('Location is required');
    if (props.location.length > 200)
      throw new InvalidRestaurantDataError(
        'Location must be at most 200 characters',
      );
    if (!TIME_REGEX.test(props.openTime))
      throw new InvalidRestaurantDataError('Open time must be in HH:mm format');
    if (!TIME_REGEX.test(props.closeTime))
      throw new InvalidRestaurantDataError(
        'Close time must be in HH:mm format',
      );
    if (props.daysOpen.some((day) => !Restaurant.isValidDay(day))) {
      throw new InvalidRestaurantDataError('Invalid day provided in daysOpen');
    }
    if (!Number.isInteger(props.totalCapacity) || props.totalCapacity <= 0)
      throw new InvalidRestaurantDataError(
        'Total capacity must be a positive integer',
      );
    if (!Number.isInteger(props.subscriptionId) || props.subscriptionId <= 0)
      throw new InvalidRestaurantDataError(
        'SubscriptionId must be a positive integer',
      );
    if (props.imageId !== undefined && props.imageId !== null) {
      if (!Number.isInteger(props.imageId) || props.imageId <= 0) {
        throw new InvalidRestaurantDataError(
          'ImageId must be a positive integer when provided',
        );
      }
    }
    const ownerId = props.ownerId?.trim();
    if (!ownerId || ownerId.length === 0) {
      if (!allowMissingOwner) {
        throw new InvalidRestaurantDataError('OwnerId is required');
      }
    }
  }

  private static isValidDay(value: string): value is RestaurantDay {
    return (
      value === 'MONDAY' ||
      value === 'TUESDAY' ||
      value === 'WEDNESDAY' ||
      value === 'THURSDAY' ||
      value === 'FRIDAY' ||
      value === 'SATURDAY' ||
      value === 'SUNDAY'
    );
  }
}
