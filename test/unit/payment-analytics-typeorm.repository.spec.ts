/**
 * Payment Analytics TypeORM Repository Unit Tests
 */

import { PaymentAnalyticsTypeOrmRepository } from './payment-analytics-type-orm.repository';
import type { PaymentAnalyticsQuery } from '@features/payment/application/dtos/analytics/payment-analytics.query';
import { PaymentStatusEnum, PaymentTypeEnum } from '@features/payment/domain/enums';

describe('PaymentAnalyticsTypeOrmRepository (unit)', () => {
  /**
   * Creates a mock query builder with chainable methods
   */
  const createMockQueryBuilder = (rawOneResult: any, rawManyResults: any[]) => {
    let callIndex = 0;
    return {
      createQueryBuilder: () => {
        const localCallIndex = callIndex++;
        const chain: any = {
          select: () => chain,
          addSelect: () => chain,
          where: () => chain,
          andWhere: () => chain,
          groupBy: () => chain,
          orderBy: () => chain,
          setParameter: () => chain,
          getRawOne: async () => rawOneResult,
          getRawMany: async () => rawManyResults[localCallIndex] || [],
        };
        return chain;
      },
    };
  };

  it('compute() returns aggregated analytics data', async () => {
    const mockTotals = {
      totalPayments: '10',
      totalAmount: '1500.00',
      averageAmount: '150.00',
      completedPayments: '7',
      pendingPayments: '2',
      cancelledPayments: '1',
      minAmount: '50.00',
      maxAmount: '300.00',
    };

    const mockStatusDistribution = [
      { status: PaymentStatusEnum.COMPLETED, count: '7' },
      { status: PaymentStatusEnum.PENDING, count: '2' },
      { status: PaymentStatusEnum.CANCELLED, count: '1' },
    ];

    const mockTypeDistribution = [
      { type: PaymentTypeEnum.RESERVATION, count: '8', amount: '1200.00' },
      { type: PaymentTypeEnum.SUBSCRIPTION, count: '2', amount: '300.00' },
    ];

    const mockRestaurantDistribution = [
      { restaurantId: 'rest-1', count: '5', amount: '750.00' },
      { restaurantId: 'rest-2', count: '5', amount: '750.00' },
    ];

    const mockRevenueTrend = [
      { date: '2025-01-01', count: '3', amount: '450.00' },
      { date: '2025-01-02', count: '4', amount: '600.00' },
      { date: '2025-01-03', count: '3', amount: '450.00' },
    ];

    // Mock repository with different results per query call
    let queryCallIndex = 0;
    const fakeRepo: any = {
      createQueryBuilder: () => {
        const localIndex = queryCallIndex++;
        const chain: any = {
          select: () => chain,
          addSelect: () => chain,
          where: () => chain,
          andWhere: () => chain,
          groupBy: () => chain,
          orderBy: () => chain,
          setParameter: () => chain,
          getRawOne: async () => (localIndex === 0 ? mockTotals : null),
          getRawMany: async () => {
            switch (localIndex) {
              case 1:
                return mockStatusDistribution;
              case 2:
                return mockTypeDistribution;
              case 3:
                return mockRestaurantDistribution;
              case 4:
                return mockRevenueTrend;
              default:
                return [];
            }
          },
        };
        return chain;
      },
    };

    const repo = new PaymentAnalyticsTypeOrmRepository(fakeRepo);
    const query: PaymentAnalyticsQuery = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };

    const result = await repo.compute(query);

    // Verify totals
    expect(result.totals.totalPayments).toBe(10);
    expect(result.totals.totalAmount).toBe(1500);
    expect(result.totals.averageAmount).toBe(150);
    expect(result.totals.completedPayments).toBe(7);
    expect(result.totals.pendingPayments).toBe(2);
    expect(result.totals.cancelledPayments).toBe(1);

    // Verify status distribution
    expect(result.statusDistribution).toHaveLength(3);
    expect(result.statusDistribution[0].status).toBe(PaymentStatusEnum.COMPLETED);
    expect(result.statusDistribution[0].count).toBe(7);

    // Verify type distribution
    expect(result.typeDistribution).toHaveLength(2);
    expect(result.typeDistribution[0].type).toBe(PaymentTypeEnum.RESERVATION);
    expect(result.typeDistribution[0].count).toBe(8);

    // Verify restaurant distribution
    expect(result.restaurantDistribution).toHaveLength(2);
    expect(result.restaurantDistribution[0].restaurantId).toBe('rest-1');

    // Verify revenue trend
    expect(result.revenueTrend).toHaveLength(3);
    expect(result.revenueTrend[0].date).toBe('2025-01-01');
    expect(result.revenueTrend[0].count).toBe(3);
    expect(result.revenueTrend[0].amount).toBe(450);
  });

  it('compute() handles null values gracefully', async () => {
    let queryCallIndex = 0;
    const fakeRepo: any = {
      createQueryBuilder: () => {
        queryCallIndex++;
        const chain: any = {
          select: () => chain,
          addSelect: () => chain,
          where: () => chain,
          andWhere: () => chain,
          groupBy: () => chain,
          orderBy: () => chain,
          setParameter: () => chain,
          getRawOne: async () => ({
            totalPayments: null,
            totalAmount: null,
            averageAmount: null,
            completedPayments: null,
            pendingPayments: null,
            cancelledPayments: null,
            minAmount: null,
            maxAmount: null,
          }),
          getRawMany: async () => [],
        };
        return chain;
      },
    };

    const repo = new PaymentAnalyticsTypeOrmRepository(fakeRepo);

    const result = await repo.compute({} as PaymentAnalyticsQuery);

    expect(result.totals.totalPayments).toBe(0);
    expect(result.totals.totalAmount).toBe(0);
    expect(result.statusDistribution).toEqual([]);
    expect(result.typeDistribution).toEqual([]);
  });
});
