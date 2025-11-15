import { describe, it, expect, jest } from '@jest/globals';
import { CreateReservationUseCase } from '@features/reservation/application/use-cases/create-reservation.use-case';
import { ReservationEntity } from '@features/reservation/domain/entities/reservation.entity';
import type { CreateReservationCommand } from '@features/reservation/application/dto';

class InMemoryReservationDomainService {
  constructor(private readonly reservation: ReservationEntity) {}

  async scheduleReservation(_data: any): Promise<ReservationEntity> {
    return this.reservation;
  }
}

describe('CreateReservationUseCase', () => {
  it('returns a reservation DTO when domain schedules reservation', async () => {
    const snapshot = ReservationEntity.rehydrate({
      id: 'res-1',
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      tableId: 'table-1',
      reservationDate: new Date('2025-01-01T00:00:00Z'),
      reservationTime: new Date('2025-01-01T19:00:00Z'),
      numberOfGuests: 2,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
      status: 'PENDING',
    });

    const domainService = new InMemoryReservationDomainService(snapshot);
    const publisher = { publish: jest.fn() } as any;

    const useCase = new CreateReservationUseCase(domainService, publisher);

    const command: CreateReservationCommand = {
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      tableId: 'table-1',
      reservationDate: new Date().toISOString(),
      reservationTime: new Date().toISOString(),
      numberOfGuests: 2,
    } as any;

    const result = await useCase.execute(command);

    expect(result).toEqual(expect.objectContaining({ userId: 'user-1' }));
    expect(publisher.publish).toHaveBeenCalled();
  });
});
