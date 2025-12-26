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
