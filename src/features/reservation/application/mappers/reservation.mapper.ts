import { ReservationEntity } from '../../domain/index.js';
import { ReservationResponseDto as ReservationResponseDto } from '../dto/index.js';

export class ReservationMapper {
  static toResponse(reservation: ReservationEntity): ReservationResponseDto {
    const snapshot = reservation.snapshot();
    return {
      id: snapshot.id,
      restaurantId: snapshot.restaurantId,
      userId: snapshot.userId,
      tableId: snapshot.tableId,
      reservationDate: snapshot.reservationDate,
      reservationTime: snapshot.reservationTime,
      numberOfGuests: snapshot.numberOfGuests,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
