import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ReservationNotFoundError,
  ReservationOwnershipError,
} from '../../domain';
import {
  DeleteReservationCommand,
  DeleteReservationResponseDto,
} from '../dto/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index.js';

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

    await this.reservationRepository.delete(command.reservationId);
    await this.eventPublisher.publish({
      type: 'reservation.deleted',
      reservationId: command.reservationId,
      restaurantId: reservation.restaurantId,
      userId: reservation.userId,
      occurredAt: new Date(),
    });
    return { ok: true };
  }
}
