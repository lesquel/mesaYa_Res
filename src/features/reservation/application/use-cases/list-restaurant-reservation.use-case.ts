import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ListRestaurantReservationsQuery,
  PaginatedReservationResponse,
} from '../dto/index.js';
import { ReservationMapper } from '../mappers/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class ListRestaurantReservationsUseCase
  implements
    UseCase<ListRestaurantReservationsQuery, PaginatedReservationResponse>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(
    query: ListRestaurantReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    const result = await this.reservationRepository.paginateByRestaurant(query);

    return {
      ...result,
      results: result.results.map((reservation) =>
        ReservationMapper.toResponse(reservation),
      ),
    };
  }
}
