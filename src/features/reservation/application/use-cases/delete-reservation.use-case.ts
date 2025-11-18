import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { DeleteReservationCommand, DeleteReservationResponseDto } from '../dto';
import { ReservationMapper } from '../mappers';
import {
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports';
import { ReservationDomainService } from '../../domain/services/reservation-domain.service';

@Injectable()
export class DeleteReservatioUseCase
  implements UseCase<DeleteReservationCommand, DeleteReservationResponseDto>
{
  constructor(
    private readonly reservationDomainService: ReservationDomainService,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: DeleteReservationCommand,
  ): Promise<DeleteReservationResponseDto> {
    const reservation = await this.reservationDomainService.cancelReservation({
      reservationId: command.reservationId,
      userId: command.userId,
      enforceOwnership: command.enforceOwnership,
    });

    const reservationResponse = ReservationMapper.toResponse(reservation);
    await this.eventPublisher.publish({
      type: 'reservation.deleted',
      reservationId: command.reservationId,
      restaurantId: reservation.restaurantId,
      userId: reservation.userId,
      occurredAt: new Date(),
    });
    return { ok: true, reservation: reservationResponse };
  }
}
