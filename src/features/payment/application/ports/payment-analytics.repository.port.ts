import type { PaymentAnalyticsQuery } from '../dtos/analytics/payment-analytics.query';
import type { PaymentAnalyticsRepositoryResult } from '../dtos/analytics/payment-analytics.response';

export interface PaymentAnalyticsRepositoryPort {
  compute(
    query: PaymentAnalyticsQuery,
  ): Promise<PaymentAnalyticsRepositoryResult>;
}
