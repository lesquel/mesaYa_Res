import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { Booking, BookingNotFoundError, BookingOwnershipError } from '../../domain';
import { UpdateBookingCommand, BookingResponseDto } from '../dto/index.js';
import { BookingMapper } from '../mappers/index.js';
import {
  BOOKING_REPOSITORY,
  type BookingRepositoryPort,
  BOOKING_EVENT_PUBLISHER,
  type BookingEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class UpdateBookingUseCase implements UseCase<UpdateBookingCommand, BookingResponseDto> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    @Inject(BOOKING_EVENT_PUBLISHER)
    private readonly eventPublisher: BookingEventPublisherPort,
  ) {}

  async execute(command: UpdateBookingCommand): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(command.bookingId);

    if (!booking) {
      throw new BookingNotFoundError(command.bookingId);
    }

    if (booking.userId !== command.userId) {
      throw new BookingOwnershipError();
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
    return BookingMapper.toResponse(saved);
  }
}
