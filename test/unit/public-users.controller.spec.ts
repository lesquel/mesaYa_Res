import { PublicUsersController } from '@features/auth/interface/controllers/v1/public-users.controller';
import { AuthAnalyticsRequestDto } from '@features/auth/interface/dto/auth-analytics.request.dto';
import type { AuthAnalyticsResponse } from '@features/auth/application/dto/responses/auth-analytics.response';

describe('PublicUsersController (unit)', () => {
  it('analytics returns reduced public DTO', async () => {
    const fakeAnalytics: AuthAnalyticsResponse = {
      summary: {
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2,
        activePercentage: 80,
        averageRegistrationsPerDay: 0.5,
      },
      registrations: {
        total: 5,
        byDate: [{ date: '2025-10-01', count: 2 }],
      },
      roles: [{ label: 'ADMIN', count: 1 }],
      permissions: [{ label: 'user:read', count: 10 }],
    };

    const getAuthAnalyticsUseCase = {
      execute: jest.fn().mockResolvedValue(fakeAnalytics),
    } as any;
    const findUserByIdUseCase = {
      execute: jest.fn().mockResolvedValue(null),
    } as any;

    const controller = new PublicUsersController(
      getAuthAnalyticsUseCase,
      findUserByIdUseCase,
    );

    const dto = new AuthAnalyticsRequestDto();
    const result = await controller.analytics(dto);

    // Public DTO should contain summary and registrations only
    expect(result.summary.totalUsers).toBe(10);
    expect(result.registrations.total).toBe(5);
    expect(result.roles).toBeUndefined();
    expect(getAuthAnalyticsUseCase.execute).toHaveBeenCalled();
  });

  it('findOne returns mapped user DTO or null', async () => {
    const user = {
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      phone: '123',
      roles: [],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    const getAuthAnalyticsUseCase = { execute: jest.fn() } as any;
    const findUserByIdUseCase = {
      execute: jest.fn().mockResolvedValue(user),
    } as any;

    const controller = new PublicUsersController(
      getAuthAnalyticsUseCase,
      findUserByIdUseCase,
    );
    const res = await controller.findOne('u1');
    expect(res).not.toBeNull();
    expect(findUserByIdUseCase.execute).toHaveBeenCalledWith('u1');
  });
});
