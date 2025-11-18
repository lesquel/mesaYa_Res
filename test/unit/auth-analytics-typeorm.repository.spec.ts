import { AuthAnalyticsTypeOrmRepository } from '@features/auth/infrastructure/database/typeorm/repositories/auth-analytics-typeorm.repository';
import type { AuthAnalyticsQuery } from '@features/auth/application/dto/queries/auth-analytics.query';

describe('AuthAnalyticsTypeOrmRepository (unit)', () => {
  it('compute() returns aggregated shape without restaurantId', async () => {
    // Prepare fake repository that returns different raw results per query call
    let call = 0;
    const fakeUsersRepo: any = {
      createQueryBuilder: () => {
        const localCall = call++;
        const chain: any = {
          innerJoin: () => chain,
          innerJoinAndSelect: () => chain,
          andWhere: () => chain,
          addSelect: () => chain,
          select: () => chain,
          setParameter: () => chain,
          groupBy: () => chain,
          orderBy: () => chain,
          addOrderBy: () => chain,
          getRawOne: async () => {
            if (localCall === 0) {
              return { totalUsers: '3', activeUsers: '2', inactiveUsers: '1' };
            }
            return {} as any;
          },
          getRawMany: async () => {
            if (localCall === 1) {
              return [{ role: 'ADMIN', count: '2' }];
            }
            if (localCall === 2) {
              return [{ permission: 'user:read', count: '3' }];
            }
            if (localCall === 3) {
              return [{ date: '2025-10-01', count: '1' }];
            }
            return [];
          },
          take: () => chain,
          skip: () => chain,
          getManyAndCount: async () => [[], 0],
        };
        return chain;
      },
    };

    const repo = new AuthAnalyticsTypeOrmRepository(fakeUsersRepo);

    const result = await repo.compute({} as AuthAnalyticsQuery);

    expect(result.totals.totalUsers).toBe(3);
    expect(result.totals.activeUsers).toBe(2);
    expect(result.roleDistribution[0].role).toBe('ADMIN');
    expect(result.roleDistribution[0].count).toBe(2);
    expect(result.permissionDistribution[0].permission).toBe('user:read');
    expect(result.registrationsByDate[0].date).toBe('2025-10-01');
  });

  it('compute() supports restaurantId by joining reservations', async () => {
    // Similar fake repo but ensure calls happen (we simply assert no throw)
    let call = 0;
    const fakeUsersRepo: any = {
      createQueryBuilder: () => {
        const localCall = call++;
        const chain: any = {
          innerJoin: () => chain,
          andWhere: () => chain,
          addSelect: () => chain,
          select: () => chain,
          setParameter: () => chain,
          groupBy: () => chain,
          orderBy: () => chain,
          getRawOne: async () => ({
            totalUsers: '1',
            activeUsers: '1',
            inactiveUsers: '0',
          }),
          getRawMany: async () => [],
          take: () => chain,
          skip: () => chain,
          getManyAndCount: async () => [[], 0],
        };
        return chain;
      },
    };

    const repo = new AuthAnalyticsTypeOrmRepository(fakeUsersRepo);
    const result = await repo.compute({
      restaurantId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    } as AuthAnalyticsQuery);
    expect(result.totals.totalUsers).toBe(1);
  });
});
