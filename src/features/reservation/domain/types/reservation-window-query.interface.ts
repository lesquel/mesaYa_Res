export interface ReservationWindowQuery {
  startAt: Date;
  endAt: Date;
  tableId?: string;
  userId?: string;
  excludeReservationId?: string;
}
