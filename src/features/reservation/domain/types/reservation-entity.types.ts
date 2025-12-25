import type { ReservationStatus } from './reservation-status.type';

export interface ReservartionProps {
  userId: string;
  restaurantId: string;
  tableId: string;
  reservationTime: Date;
  reservationDate: Date;
  numberOfGuests: number;
  createdAt: Date;
  updatedAt: Date;
  status: ReservationStatus;
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

export interface ReservationValidationOptions {
  allowPastReservation?: boolean;
}
