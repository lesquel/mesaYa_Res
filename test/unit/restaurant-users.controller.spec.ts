import { RestaurantUsersController } from '@features/auth/interface/controllers/v1/restaurant-users.controller';
import { AuthAnalyticsRequestDto } from '@features/auth/interface/dto/auth-analytics.request.dto';

describe('RestaurantUsersController (unit)', () => {
  it('analyticsByRestaurant forwards restaurantId to use-case', async () => {
    const mockedExecute = jest.fn().mockResolvedValue({ summary: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, activePercentage: 0, averageRegistrationsPerDay: 0 }, registrations: { total: 0, byDate: [] }, roles: [], permissions: [] });
    const getAuthAnalyticsUseCase = { execute: mockedExecute } as any;
    const controller = new RestaurantUsersController(getAuthAnalyticsUseCase);

    const dto = new AuthAnalyticsRequestDto();
    await controller.analyticsByRestaurant('r1', dto);

    expect(mockedExecute).toHaveBeenCalled();
    const calledWith = mockedExecute.mock.calls[0][0];
    expect(calledWith.restaurantId).toBe('r1');
  });
});
