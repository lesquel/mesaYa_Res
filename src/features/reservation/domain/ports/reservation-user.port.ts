export interface ReservationUserSnapshot {
  userId: string;
  active: boolean;
}

export abstract class IReservationUserPort {
  abstract loadById(userId: string): Promise<ReservationUserSnapshot | null>;
}
