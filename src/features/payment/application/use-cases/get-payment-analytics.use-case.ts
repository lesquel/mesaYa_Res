import { Inject, Injectable } from '@nestjs/common';
import { toRounded } from '@shared/application/utils';
import type {
  PaymentAnalyticsQuery,
  PaymentAnalyticsResponse,
  PaymentAnalyticsRepositoryResult,
} from '../dtos';
import { type PaymentAnalyticsRepositoryPort } from '../ports/payment-analytics.repository.port';
import { PAYMENT_ANALYTICS_REPOSITORY } from '@features/payment/payment.tokens';

@Injectable()
export class GetPaymentAnalyticsUseCase {
  constructor(
    @Inject(PAYMENT_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: PaymentAnalyticsRepositoryPort,
  ) {}

  async execute(
    query: PaymentAnalyticsQuery,
  ): Promise<PaymentAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    const completionRate = this.calculateCompletionRate(analytics);

    return {
      summary: {
        totalPayments: analytics.totals.totalPayments,
        totalAmount: toRounded(analytics.totals.totalAmount),
        averageAmount: toRounded(analytics.totals.averageAmount),
        completedPayments: analytics.totals.completedPayments,
        pendingPayments: analytics.totals.pendingPayments,
        cancelledPayments: analytics.totals.cancelledPayments,
        completionRate,
        minAmount: toRounded(analytics.totals.minAmount),
        maxAmount: toRounded(analytics.totals.maxAmount),
      },
      revenue: {
        totalAmount: toRounded(analytics.totals.totalAmount),
        totalPayments: analytics.totals.totalPayments,
        byDate: analytics.revenueByDate.map((point) => ({
          date: point.date,
          count: point.count,
          amount: toRounded(point.amount),
        })),
      },
      statuses: analytics.statusDistribution.map((row) => ({
        status: row.status,
        count: row.count,
      })),
      types: analytics.typeDistribution.map((row) => ({
        type: row.type,
        count: row.count,
        amount: toRounded(row.amount),
      })),
      topRestaurants: analytics.restaurantDistribution.map((row) => ({
        restaurantId: row.restaurantId,
        count: row.count,
        amount: toRounded(row.amount),
      })),
    };
  }

  private calculateCompletionRate(
    analytics: PaymentAnalyticsRepositoryResult,
  ): number {
    if (analytics.totals.totalPayments === 0) {
      return 0;
    }

    const rate =
      (analytics.totals.completedPayments / analytics.totals.totalPayments) *
      100;
    return toRounded(rate);
  }
}
