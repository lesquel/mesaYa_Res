import type { PaymentAnalyticsQuery } from '../dtos/analytics/payment-analytics.query';
import type { PaymentAnalyticsRepositoryResult } from '../dtos/analytics/payment-analytics.response';

export const PAYMENT_ANALYTICS_REPOSITORY = Symbol(
  'PAYMENT_ANALYTICS_REPOSITORY',
);

export interface PaymentAnalyticsRepositoryPort {
  compute(
    query: PaymentAnalyticsQuery,
  ): Promise<PaymentAnalyticsRepositoryResult>;
}
