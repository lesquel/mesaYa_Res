import { describe, it, expect, jest } from '@jest/globals';
import { UpdateReservationUseCase } from '@features/reservation/application/use-cases/update-reservation.use-case';
import { ReservationEntity } from '@features/reservation/domain/entities/reservation.entity';
import type { UpdateReservationCommand } from '@features/reservation/application/dto';

class InMemoryReservationDomainService {
  constructor(private readonly reservation: ReservationEntity) {}

  async updateReservation(_data: any): Promise<ReservationEntity> {
    return this.reservation;
  }
}

describe('UpdateReservationUseCase', () => {
  it('updates reservation and publishes event', async () => {
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

    const useCase = new UpdateReservationUseCase(
      domainService as any,
      publisher,
    );

    const command: UpdateReservationCommand = {
      reservationId: 'res-1',
      userId: 'user-1',
      reservationDate: new Date().toISOString(),
      reservationTime: new Date().toISOString(),
      numberOfGuests: 3,
    } as any;

    const result = await useCase.execute(command);

    expect(result).toEqual(expect.objectContaining({ userId: 'user-1' }));
    expect(publisher.publish).toHaveBeenCalled();
  });
});
