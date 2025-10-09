import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { BookingNotFoundError } from '../../domain';
import { FindBookingQuery, BookingResponseDto } from '../dto/index.js';
import { BookingMapper } from '../mappers/index.js';
import {
  BOOKING_REPOSITORY,
  type BookingRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class FindBookingUseCase implements UseCase<FindBookingQuery, BookingResponseDto> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(query: FindBookingQuery): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(query.bookingId);

    if (!booking) {
      throw new BookingNotFoundError(query.bookingId);
    }

    return BookingMapper.toResponse(booking);
  }
}
