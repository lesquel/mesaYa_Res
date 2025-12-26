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
