export class ReservationOutsideOperatingHoursError extends Error {
  constructor(restaurantId: string) {
    super(
      `Requested reservation time falls outside restaurant ${restaurantId} operating hours`,
    );
    this.name = ReservationOutsideOperatingHoursError.name;
  }
}
