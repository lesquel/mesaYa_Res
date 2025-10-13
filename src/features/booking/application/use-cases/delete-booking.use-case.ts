import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { BookingNotFoundError, BookingOwnershipError } from '../../domain';
import { DeleteBookingCommand, DeleteBookingResponseDto } from '../dto/index.js';
import {
  BOOKING_REPOSITORY,
  type BookingRepositoryPort,
  BOOKING_EVENT_PUBLISHER,
  type BookingEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class DeleteBookingUseCase implements UseCase<DeleteBookingCommand, DeleteBookingResponseDto> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    @Inject(BOOKING_EVENT_PUBLISHER)
    private readonly eventPublisher: BookingEventPublisherPort,
  ) {}

  async execute(command: DeleteBookingCommand): Promise<DeleteBookingResponseDto> {
    const booking = await this.bookingRepository.findById(command.bookingId);

    if (!booking) {
      throw new BookingNotFoundError(command.bookingId);
    }

    if (booking.userId !== command.userId) {
      throw new BookingOwnershipError();
    }

    await this.bookingRepository.delete(command.bookingId);
    await this.eventPublisher.publish({
      type: 'booking.deleted',
      bookingId: command.bookingId,
      restaurantId: booking.restaurantId,
      userId: booking.userId,
      occurredAt: new Date(),
    });
    return { ok: true };
  }
}
