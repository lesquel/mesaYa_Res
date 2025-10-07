import { InvalidBookingDataError } from '../errors/index.js';

export interface BookingProps {
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

export type CreateBookingProps = Omit<BookingProps, 'createdAt' | 'updatedAt' | 'status'>;

export type UpdateBookingProps = Partial<Omit<BookingProps, 'userId' | 'restaurantId' | 'tableId' | 'createdAt'>>;

export interface BookingSnapshot extends BookingProps {
    id: string;
}

export class Booking {
    private constructor(
        private readonly _id: string,
        private props: BookingProps,
    ) { }
    static create(id: string, props: BookingProps): Booking {
        const now = new Date();

        const bookingProps: BookingProps = {
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

        this.validate(bookingProps);

        return new Booking(id, bookingProps);
    }

    static rehydrate(snapshot: BookingSnapshot): Booking {
        this.validate(snapshot);
        return new Booking(snapshot.id, { ...snapshot });
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

    update(props: UpdateBookingProps): void {
        const updatedProps: BookingProps = {
            ...this.props,
            ...props,
            updatedAt: new Date(),
        };
        Booking.validate(updatedProps);
        this.props = updatedProps;
    }

    snapshot(): BookingSnapshot {
        return {
            id: this._id,
            ...this.props,
        };
    }

    private static validate(props: BookingProps | BookingSnapshot): void {
        if (props.numberOfGuests <= 0) {
            throw new InvalidBookingDataError('Number of guests must be greater than zero.');
        }
        if (props.reservationDate < new Date()) {
            throw new InvalidBookingDataError('Reservation date must be in the future.');
        }
        if (props.reservationTime < new Date()) {
            throw new InvalidBookingDataError('Reservation time must be in the future.');
        }
    }

    private static normalizeId(value: string, label: string): string {
        if (!value || value.trim().length === 0) {
            throw new InvalidBookingDataError(`${label} cannot be empty.`);
        }
        return value.trim();
    }

}

