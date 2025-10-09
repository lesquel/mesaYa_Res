import { Booking } from '../../domain/index.js';
import { BookingResponseDto } from '../dto/index.js';

export class BookingMapper {
  static toResponse(booking: Booking): BookingResponseDto {
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
