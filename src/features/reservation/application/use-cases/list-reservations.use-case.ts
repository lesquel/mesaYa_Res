import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ListReservationsQuery, PaginatedReservationResponse } from '../dto';
import { ReservationMapper } from '../mappers';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports';

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
