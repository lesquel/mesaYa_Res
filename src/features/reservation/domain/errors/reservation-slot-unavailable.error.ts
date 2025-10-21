export class ReservationSlotUnavailableError extends Error {
  constructor(tableId: string, startAt: Date) {
    super(
      `Reservation slot is unavailable for table ${tableId} at ${startAt.toISOString()}`,
    );
    this.name = ReservationSlotUnavailableError.name;
  }
}
