import { InvalidReservationDataError } from '../errors';
import type {
  CreateReservationProps,
  ReservartionProps,
  ReservationSnapshot,
  ReservationStatus,
  ReservationValidationOptions,
  UpdateReservationProps,
} from '../types';

// Re-export for backward compatibility
export type {
  CreateReservationProps,
  ReservartionProps,
  ReservationSnapshot,
  UpdateReservationProps,
} from '../types';

export class ReservationEntity {
  constructor(
    private readonly _id: string,
    private props: ReservartionProps,
  ) {}
  static create(id: string, props: ReservartionProps): ReservationEntity {
    const now = new Date();

    const reservationProps: ReservartionProps = {
      userId: this.normalizeId(props.userId, 'User ID'),
      restaurantId: this.normalizeId(props.restaurantId, 'Restaurant ID'),
      tableId: this.normalizeId(props.tableId, 'Table ID'),
      reservationTime: props.reservationTime,
      reservationDate: props.reservationDate,
      numberOfGuests: props.numberOfGuests,
      createdAt: props.createdAt || now,
      updatedAt: now,
      status: props.status || 'PENDING',
    };

    this.validate(reservationProps);

    return new ReservationEntity(id, reservationProps);
  }

  static rehydrate(snapshot: ReservationSnapshot): ReservationEntity {
    this.validate(snapshot, { allowPastReservation: true });
    return new ReservationEntity(snapshot.id, { ...snapshot });
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get restaurantId(): string {
    return this.props.restaurantId;
  }
  get tableId(): string {
    return this.props.tableId;
  }
  get reservationTime(): Date {
    return this.props.reservationTime;
  }
  get reservationDate(): Date {
    return this.props.reservationDate;
  }
  get numberOfGuests(): number {
    return this.props.numberOfGuests;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get status(): ReservationStatus {
    return this.props.status;
  }

  update(props: UpdateReservationProps): void {
    const updatedProps: ReservartionProps = {
      ...this.props,
      ...props,
      updatedAt: new Date(),
    };
    const now = new Date();
    const overridesReservationDate =
      'reservationDate' in props && props.reservationDate !== undefined;
    const overridesReservationTime =
      'reservationTime' in props && props.reservationTime !== undefined;

    const existingReservationIsInPast =
      this.props.reservationDate < now || this.props.reservationTime < now;

    ReservationEntity.validate(updatedProps, {
      allowPastReservation:
        existingReservationIsInPast &&
        !overridesReservationDate &&
        !overridesReservationTime,
    });
    this.props = updatedProps;
  }

  changeStatus(nextStatus: ReservationStatus): void {
    this.props = {
      ...this.props,
      status: nextStatus,
      updatedAt: new Date(),
    };
  }

  snapshot(): ReservationSnapshot {
    return {
      id: this._id,
      ...this.props,
    };
  }

  private static validate(
    props: ReservartionProps | ReservationSnapshot,
    options: ReservationValidationOptions = {},
  ): void {
    const now = new Date();

    if (props.numberOfGuests <= 0) {
      throw new InvalidReservationDataError(
        'Number of guests must be greater than zero.',
      );
    }
    if (!options.allowPastReservation && props.reservationDate < now) {
      throw new InvalidReservationDataError(
        'Reservation date must be in the future.',
      );
    }
    if (!options.allowPastReservation && props.reservationTime < now) {
      throw new InvalidReservationDataError(
        'Reservation time must be in the future.',
      );
    }
  }

  private static normalizeId(value: string, label: string): string {
    if (!value || value.trim().length === 0) {
      throw new InvalidReservationDataError(`${label} cannot be empty.`);
    }
    return value.trim();
  }
}
