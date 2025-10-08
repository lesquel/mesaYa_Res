import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { ListBookingsQuery, PaginatedBookingResponse } from '../dto/index.js';
import { BookingMapper } from '../mappers/index.js';
import { BOOKING_REPOSITORY, type BookingRepositoryPort } from '../ports/index.js';

@Injectable()
export class ListBookingsUseCase
  implements UseCase<ListBookingsQuery, PaginatedBookingResponse>
{
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(query: ListBookingsQuery): Promise<PaginatedBookingResponse> {
    const result = await this.bookingRepository.paginate(query);

    return {
      ...result,
      results: result.results.map((booking) => BookingMapper.toResponse(booking)),
    };
  }
}
