export interface ReservationScheduleRequest {
  reservationId: string;
  userId: string;
  restaurantId: string;
  tableId: string;
  reservationDate: Date;
  reservationTime: Date;
  numberOfGuests: number;
  durationMinutes?: number;
}

export interface ReservationUpdateRequest {
  reservationId: string;
  userId: string;
  reservationDate?: Date;
  reservationTime?: Date;
  numberOfGuests?: number;
  durationMinutes?: number;
}

export interface ReservationCancellationRequest {
  reservationId: string;
  userId: string;
}

export interface ReservationWindowQuery {
  startAt: Date;
  endAt: Date;
  tableId?: string;
  userId?: string;
  excludeReservationId?: string;
}
