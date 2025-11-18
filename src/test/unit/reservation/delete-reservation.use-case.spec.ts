import { describe, it, expect, jest } from '@jest/globals';
import { DeleteReservatioUseCase } from '@features/reservation/application/use-cases/delete-reservation.use-case';
import { ReservationEntity } from '@features/reservation/domain/entities/reservation.entity';
import type { DeleteReservationCommand } from '@features/reservation/application/dto';

class InMemoryReservationDomainService {
  constructor(private readonly reservation: ReservationEntity) {}

  async cancelReservation(_data: any): Promise<ReservationEntity> {
    return this.reservation;
  }
}

describe('DeleteReservatioUseCase', () => {
  it('cancels reservation and returns snapshot', async () => {
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
      status: 'CANCELLED',
    });

    const domainService = new InMemoryReservationDomainService(snapshot);
    const publisher = { publish: jest.fn() } as any;

    const useCase = new DeleteReservatioUseCase(
      domainService as any,
      publisher,
    );

    const command: DeleteReservationCommand = {
      reservationId: 'res-1',
      userId: 'user-1',
    } as any;

    const result = await useCase.execute(command);

    expect(result.ok).toBe(true);
    expect(result.reservation).toEqual(
      expect.objectContaining({ id: 'res-1' }),
    );
    expect(publisher.publish).toHaveBeenCalled();
  });
});
