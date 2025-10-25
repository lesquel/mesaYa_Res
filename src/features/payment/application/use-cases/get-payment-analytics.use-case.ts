import { Inject, Injectable } from '@nestjs/common';
import type { PaymentAnalyticsQuery } from '../dtos/analytics/payment-analytics.query';
import type {
  PaymentAnalyticsResponse,
  PaymentAnalyticsRepositoryResult,
} from '../dtos/analytics/payment-analytics.response';
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
        totalAmount: this.toCurrency(analytics.totals.totalAmount),
        averageAmount: this.toCurrency(analytics.totals.averageAmount),
        completedPayments: analytics.totals.completedPayments,
        pendingPayments: analytics.totals.pendingPayments,
        cancelledPayments: analytics.totals.cancelledPayments,
        completionRate,
        minAmount: this.toCurrency(analytics.totals.minAmount),
        maxAmount: this.toCurrency(analytics.totals.maxAmount),
      },
      revenue: {
        totalAmount: this.toCurrency(analytics.totals.totalAmount),
        totalPayments: analytics.totals.totalPayments,
        byDate: analytics.revenueByDate.map((point) => ({
          date: point.date,
          count: point.count,
          amount: this.toCurrency(point.amount),
        })),
      },
      statuses: analytics.statusDistribution.map((row) => ({
        status: row.status,
        count: row.count,
      })),
      types: analytics.typeDistribution.map((row) => ({
        type: row.type,
        count: row.count,
        amount: this.toCurrency(row.amount),
      })),
      topRestaurants: analytics.restaurantDistribution.map((row) => ({
        restaurantId: row.restaurantId,
        count: row.count,
        amount: this.toCurrency(row.amount),
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
    return Number(rate.toFixed(2));
  }

  private toCurrency(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
