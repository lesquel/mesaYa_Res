import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  ListRestaurantReservationsQuery,
  PaginatedReservationResponse,
} from '../dto/index';
import { ReservationMapper } from '../mappers/index';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports/index';

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
