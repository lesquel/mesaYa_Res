import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  Reservation,
  ReservationNotFoundError,
  ReservationOwnershipError,
} from '../../domain';
import {
  UpdateReservationCommand,
  ReservationResponseDto,
} from '../dto/index.js';
import { ReservationMapper } from '../mappers/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
  BOOKING_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class UpdateReservationUseCase
  implements UseCase<UpdateReservationCommand, ReservationResponseDto>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly bookingRepository: ReservationRepositoryPort,
    @Inject(BOOKING_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: UpdateReservationCommand,
  ): Promise<ReservationResponseDto> {
    const booking = await this.bookingRepository.findById(command.bookingId);

    if (!booking) {
      throw new ReservationNotFoundError(command.bookingId);
    }

    if (booking.userId !== command.userId) {
      throw new ReservationOwnershipError();
    }

    const updateData = {
      ...(command.reservationDate !== undefined && {
        reservationDate: command.reservationDate
          ? new Date(command.reservationDate as unknown as string)
          : undefined,
      }),
      ...(command.reservationTime !== undefined && {
        reservationTime: command.reservationTime
          ? new Date(command.reservationTime as unknown as string)
          : undefined,
      }),
      ...(command.numberOfGuests !== undefined && {
        numberOfGuests: command.numberOfGuests,
      }),
      // status updates are not supported via this command
    };

    booking.update(updateData);
    const saved = await this.bookingRepository.save(booking);
    await this.eventPublisher.publish({
      type: 'booking.updated',
      bookingId: saved.id,
      restaurantId: saved.restaurantId,
      userId: saved.userId,
      occurredAt: new Date(),
      data: { numberOfGuests: saved.numberOfGuests },
    });
    return ReservationMapper.toResponse(saved);
  }
}
