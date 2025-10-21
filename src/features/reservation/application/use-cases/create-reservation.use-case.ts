import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { randomUUID } from 'crypto';
import { ReservationMapper } from '../mappers/index';
import { ReservationResponseDto, CreateReservationCommand } from '../dto/index';
import {
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index';
import { ReservationDomainService } from '../../domain/services/reservation-domain.service';

@Injectable()
export class CreateReservationUseCase
  implements UseCase<CreateReservationCommand, ReservationResponseDto>
{
  constructor(
    private readonly reservationDomainService: ReservationDomainService,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: CreateReservationCommand,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.reservationDomainService.scheduleReservation(
      {
        reservationId: randomUUID(),
        userId: command.userId,
        restaurantId: command.restaurantId,
        tableId: command.tableId,
        reservationDate: new Date(command.reservationDate),
        reservationTime: new Date(command.reservationTime),
        numberOfGuests: command.numberOfGuests,
      },
    );

    await this.eventPublisher.publish({
      type: 'reservation.created',
      reservationId: reservation.id,
      restaurantId: reservation.restaurantId,
      userId: reservation.userId,
      occurredAt: new Date(),
      data: { numberOfGuests: reservation.numberOfGuests },
    });
    return ReservationMapper.toResponse(reservation);
  }
}
