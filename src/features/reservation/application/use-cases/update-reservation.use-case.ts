import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { UpdateReservationCommand, ReservationResponseDto } from '../dto/index';
import { ReservationMapper } from '../mappers/index';
import {
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index';
import { ReservationDomainService } from '../../domain/services/reservation-domain.service';

@Injectable()
export class UpdateReservationUseCase
  implements UseCase<UpdateReservationCommand, ReservationResponseDto>
{
  constructor(
    private readonly reservationDomainService: ReservationDomainService,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: UpdateReservationCommand,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.reservationDomainService.updateReservation({
      reservationId: command.reservationId,
      userId: command.userId,
      reservationDate: command.reservationDate
        ? new Date(command.reservationDate as unknown as string)
        : undefined,
      reservationTime: command.reservationTime
        ? new Date(command.reservationTime as unknown as string)
        : undefined,
      numberOfGuests: command.numberOfGuests,
    });

    await this.eventPublisher.publish({
      type: 'reservation.updated',
      reservationId: reservation.id,
      restaurantId: reservation.restaurantId,
      userId: reservation.userId,
      occurredAt: new Date(),
      data: { numberOfGuests: reservation.numberOfGuests },
    });
    return ReservationMapper.toResponse(reservation);
  }
}
