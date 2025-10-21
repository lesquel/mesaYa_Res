export class ReservationMaxAdvanceWindowError extends Error {
  constructor(months: number) {
    super(
      `Reservations cannot be scheduled more than ${months} months in advance`,
    );
    this.name = ReservationMaxAdvanceWindowError.name;
  }
}
