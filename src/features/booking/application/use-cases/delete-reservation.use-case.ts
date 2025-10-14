import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ReservationNotFoundError,
  ReservationOwnershipError,
} from '../../domain';
import {
  DeleteReservationCommand,
  DeleteBookingResponseDto,
} from '../dto/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
  BOOKING_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class DeleteReservatioUseCase
  implements UseCase<DeleteReservationCommand, DeleteBookingResponseDto>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly bookingRepository: ReservationRepositoryPort,
    @Inject(BOOKING_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: DeleteReservationCommand,
  ): Promise<DeleteBookingResponseDto> {
    const reservation = await this.bookingRepository.findById(command.bookingId);

    if (!reservation) {
      throw new ReservationNotFoundError(command.bookingId);
    }

    if (reservation.userId !== command.userId) {
      throw new ReservationOwnershipError();
    }

    await this.bookingRepository.delete(command.bookingId);
    await this.eventPublisher.publish({
      type: 'reservation.deleted',
      bookingId: command.bookingId,
      restaurantId: reservation.restaurantId,
      userId: reservation.userId,
      occurredAt: new Date(),
    });
    return { ok: true };
  }
}
