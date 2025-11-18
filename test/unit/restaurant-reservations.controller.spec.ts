import { BadRequestException } from '@nestjs/common';
import { RestaurantReservationsController } from '@features/reservation/interface/controllers/v1/restaurant-reservations.controller';
import { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';

describe('RestaurantReservationsController (unit)', () => {
  it('rejects an invalid restaurantId filter before calling the use case', async () => {
    const listOwnerReservations = {
      execute: jest.fn(),
    } as any;

    const controller = new RestaurantReservationsController(
      listOwnerReservations,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const pagination: PaginatedQueryParams = {
      route: '/restaurant/reservations',
      pagination: { page: 1, limit: 10 },
    };
    const raw: Record<string, unknown> = {
      restaurantId: 'not-a-uuid',
    };
    const user: CurrentUserPayload = {
      userId: 'owner-1',
    };

    await expect(controller.list(pagination, raw, user)).rejects.toThrow(
      BadRequestException,
    );
    expect(listOwnerReservations.execute).not.toHaveBeenCalled();
  });
});
