import { describe, it, expect } from '@jest/globals';
import { ListReservationsUseCase } from '@features/reservation/application/use-cases/list-reservations.use-case';
import { ReservationEntity } from '@features/reservation/domain/entities/reservation.entity';
import type { PaginatedResult } from '@shared/application/types/pagination';

class InMemoryReservationRepository {
  public lastQuery: any;
  constructor(private readonly result: PaginatedResult<ReservationEntity>) {}

  async paginate(query: any): Promise<PaginatedResult<ReservationEntity>> {
    this.lastQuery = query;
    return this.result;
  }
}

describe('ListReservationsUseCase', () => {
  it('maps paginated reservations to DTOs', async () => {
    const reservation = ReservationEntity.rehydrate({
      id: 'res-1',
      userId: 'user-1',
      restaurantId: 'rest-1',
      tableId: 'table-1',
      reservationDate: new Date('2025-01-01T00:00:00Z'),
      reservationTime: new Date('2025-01-01T19:00:00Z'),
      numberOfGuests: 2,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
      status: 'PENDING',
    });

    const paginated: PaginatedResult<ReservationEntity> = {
      results: [reservation],
      total: 1,
      page: 1,
      limit: 10,
      offset: 0,
      pages: 1,
      hasNext: false,
      hasPrev: false,
      links: { self: '/public/reservations?page=1', first: '/public/reservations?page=1', last: '/public/reservations?page=1' },
    };

    const repo = new InMemoryReservationRepository(paginated as any);
    const useCase = new ListReservationsUseCase(repo as any);

    const query = { pagination: { page: 1, limit: 10, offset: 0 }, route: '/public/reservations' } as any;
    const response = await useCase.execute(query);

    expect(repo.lastQuery).toEqual(query);
    expect(response.total).toBe(1);
    expect(response.results[0]).toEqual(expect.objectContaining({ userId: 'user-1' }));
  });
});
