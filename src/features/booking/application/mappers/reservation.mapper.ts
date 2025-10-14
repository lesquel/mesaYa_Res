import { Reservation } from '../../domain/index.js';
import { ReservationResponseDto as ReservationResponseDto } from '../dto/index.js';

export class ReservationMapper {
  static toResponse(booking: Reservation): ReservationResponseDto {
    const snapshot = booking.snapshot();
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
