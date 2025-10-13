import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ListRestaurantBookingsQuery,
  PaginatedBookingResponse,
} from '../dto/index.js';
import { BookingMapper } from '../mappers/index.js';
import {
  BOOKING_REPOSITORY,
  type BookingRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class ListRestaurantBookingsUseCase
  implements UseCase<ListRestaurantBookingsQuery, PaginatedBookingResponse>
{
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(
    query: ListRestaurantBookingsQuery,
  ): Promise<PaginatedBookingResponse> {
    const result = await this.bookingRepository.paginateByRestaurant(query);

    return {
      ...result,
      results: result.results.map((booking) => BookingMapper.toResponse(booking)),
    };
  }
}
