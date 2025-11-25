import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  ListOwnerReservationsQuery,
  PaginatedReservationResponse,
} from '../dto';
import { ReservationMapper } from '../mappers';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports';
import { ReservationOwnerAccessService } from '../services/reservation-owner-access.service';

@Injectable()
export class ListOwnerReservationsUseCase
  implements UseCase<ListOwnerReservationsQuery, PaginatedReservationResponse>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
    private readonly ownerAccess: ReservationOwnerAccessService,
  ) {}

  async execute(
    query: ListOwnerReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    if (query.restaurantId) {
      await this.ownerAccess.assertRestaurantOwnership(
        query.restaurantId,
        query.ownerId,
      );
    }

    const result = await this.reservationRepository.paginateByOwner(query);
    const userSnapshots = (result as any).userSnapshots as Map<string, { name?: string; email?: string; phone?: string }> | undefined;

    return {
      ...result,
      results: result.results.map((reservation) => {
        const snapshot = reservation.snapshot();
        const userInfo = userSnapshots?.get(snapshot.id);
        return ReservationMapper.toResponse(reservation, {
          userName: userInfo?.name,
          userEmail: userInfo?.email,
        });
      }),
    };
  }
}
