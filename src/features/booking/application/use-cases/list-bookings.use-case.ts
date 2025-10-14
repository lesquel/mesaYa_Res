import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ListReservationsQuery,
  PaginatedBookingResponse,
} from '../dto/index.js';
import { ReservationMapper } from '../mappers/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class ListReservationsUseCase
  implements UseCase<ListReservationsQuery, PaginatedBookingResponse>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly bookingRepository: ReservationRepositoryPort,
  ) {}

  async execute(
    query: ListReservationsQuery,
  ): Promise<PaginatedBookingResponse> {
    const result = await this.bookingRepository.paginate(query);

    return {
      ...result,
      results: result.results.map((booking) =>
        ReservationMapper.toResponse(booking),
      ),
    };
  }
}
