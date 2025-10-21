export class ReservationCapacityExceededError extends Error {
  constructor(tableId: string, capacity: number) {
    super(`Reservation exceeds capacity ${capacity} for table ${tableId}`);
    this.name = ReservationCapacityExceededError.name;
  }
}
