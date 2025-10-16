import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ListReservationsQuery,
  PaginatedReservationResponse,
} from '../dto/index.js';
import { ReservationMapper } from '../mappers/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class ListReservationsUseCase
  implements UseCase<ListReservationsQuery, PaginatedReservationResponse>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(
    query: ListReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    const result = await this.reservationRepository.paginate(query);

    return {
      ...result,
      results: result.results.map((reservation) =>
        ReservationMapper.toResponse(reservation),
      ),
    };
  }
}
