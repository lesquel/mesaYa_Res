export interface ReservationTableSnapshot {
  tableId: string;
  restaurantId: string;
  sectionId: string;
  capacity: number;
}

export abstract class IReservationTablePort {
  abstract loadById(tableId: string): Promise<ReservationTableSnapshot | null>;
}
