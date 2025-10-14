import { InvalidReservationDataError } from '../errors/index.js';

export interface ReservartionProps {
  userId: string;
  restaurantId: string;
  tableId: string;
  reservationTime: Date;
  reservationDate: Date;
  numberOfGuests: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export type CreateReservationProps = Omit<
  ReservartionProps,
  'createdAt' | 'updatedAt' | 'status'
>;

export type UpdateReservationProps = Partial<
  Omit<ReservartionProps, 'userId' | 'restaurantId' | 'tableId' | 'createdAt'>
>;

export interface ReservationSnapshot extends ReservartionProps {
  id: string;
}

export class Reservation {
  private constructor(
    private readonly _id: string,
    private props: ReservartionProps,
  ) {}
  static create(id: string, props: ReservartionProps): Reservation {
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

    return new Reservation(id, reservationProps);
  }

  static rehydrate(snapshot: ReservationSnapshot): Reservation {
    this.validate(snapshot);
    return new Reservation(snapshot.id, { ...snapshot });
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
  get status(): 'PENDING' | 'CONFIRMED' | 'CANCELLED' {
    return this.props.status;
  }

  update(props: UpdateReservationProps): void {
    const updatedProps: ReservartionProps = {
      ...this.props,
      ...props,
      updatedAt: new Date(),
    };
    Reservation.validate(updatedProps);
    this.props = updatedProps;
  }

  snapshot(): ReservationSnapshot {
    return {
      id: this._id,
      ...this.props,
    };
  }

  private static validate(
    props: ReservartionProps | ReservationSnapshot,
  ): void {
    if (props.numberOfGuests <= 0) {
      throw new InvalidReservationDataError(
        'Number of guests must be greater than zero.',
      );
    }
    if (props.reservationDate < new Date()) {
      throw new InvalidReservationDataError(
        'Reservation date must be in the future.',
      );
    }
    if (props.reservationTime < new Date()) {
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
