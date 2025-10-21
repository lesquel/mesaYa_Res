export class ReservationTableMismatchError extends Error {
  constructor(restaurantId: string, tableId: string) {
    super(`Table ${tableId} does not belong to restaurant ${restaurantId}`);
    this.name = ReservationTableMismatchError.name;
  }
}
