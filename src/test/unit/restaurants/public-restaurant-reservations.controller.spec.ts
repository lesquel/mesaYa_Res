import { NotFoundException } from '@nestjs/common';
import { PublicRestaurantReservationsController } from '@features/restaurants/interface/controllers/v1/public-restaurant-reservations.controller';

describe('PublicRestaurantReservationsController', () => {
  it('redirects callers to the public reservations endpoint', () => {
    const controller = new PublicRestaurantReservationsController();

    expect(() => controller.handleLegacyPath()).toThrow(NotFoundException);

    try {
      controller.handleLegacyPath();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).getResponse()).toMatchObject({
        movedTo: '/api/v1/reservations',
      });
    }
  });
});
