export class ReservationTableNotFoundError extends Error {
  constructor(tableId: string) {
    super(`Table ${tableId} not found`);
    this.name = ReservationTableNotFoundError.name;
  }
}
