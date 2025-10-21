import { ReservationEntity } from '../entities/reservation.entity';
import { ReservationWindowQuery } from '../types';

export abstract class IReservationRepositoryPort {
  abstract save(reservation: ReservationEntity): Promise<ReservationEntity>;
  abstract findById(reservationId: string): Promise<ReservationEntity | null>;
  abstract delete(reservationId: string): Promise<void>;
  abstract findActiveWithinWindow(
    query: ReservationWindowQuery,
  ): Promise<ReservationEntity[]>;
}
