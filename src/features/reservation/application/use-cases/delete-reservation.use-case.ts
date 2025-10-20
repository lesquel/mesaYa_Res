import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  ReservationNotFoundError,
  ReservationOwnershipError,
} from '../../domain';
import {
  DeleteReservationCommand,
  DeleteReservationResponseDto,
} from '../dto/index';
import { ReservationMapper } from '../mappers/index';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index';

@Injectable()
export class DeleteReservatioUseCase
  implements UseCase<DeleteReservationCommand, DeleteReservationResponseDto>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: DeleteReservationCommand,
  ): Promise<DeleteReservationResponseDto> {
    const reservation = await this.reservationRepository.findById(
      command.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(command.reservationId);
    }

    if (reservation.userId !== command.userId) {
      throw new ReservationOwnershipError();
    }

    const reservationResponse = ReservationMapper.toResponse(reservation);

    await this.reservationRepository.delete(command.reservationId);
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
