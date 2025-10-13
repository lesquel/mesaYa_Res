import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { BookingNotFoundError, BookingOwnershipError } from '../../domain';
import { DeleteBookingCommand, DeleteBookingResponseDto } from '../dto/index.js';
import {
  BOOKING_REPOSITORY,
  type BookingRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class DeleteBookingUseCase implements UseCase<DeleteBookingCommand, DeleteBookingResponseDto> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
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
    return { ok: true };
  }
}
