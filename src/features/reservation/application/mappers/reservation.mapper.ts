import { ReservationEntity } from '../../domain';
import { ReservationResponseDto as ReservationResponseDto } from '../dto';

export interface ReservationMapperContext {
  userName?: string;
  userEmail?: string;
}

export class ReservationMapper {
  static toResponse(
    reservation: ReservationEntity,
    context?: ReservationMapperContext,
  ): ReservationResponseDto {
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
      userName: context?.userName,
      userEmail: context?.userEmail,
    };
  }
}
