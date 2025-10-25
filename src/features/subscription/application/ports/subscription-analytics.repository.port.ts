import type { SubscriptionAnalyticsQuery } from '../dtos/analytics/subscription-analytics.query';
import type { SubscriptionAnalyticsRepositoryResult } from '../dtos/analytics/subscription-analytics.response';

export const SUBSCRIPTION_ANALYTICS_REPOSITORY = Symbol(
  'SUBSCRIPTION_ANALYTICS_REPOSITORY',
);

export interface SubscriptionAnalyticsRepositoryPort {
  compute(
    query: SubscriptionAnalyticsQuery,
  ): Promise<SubscriptionAnalyticsRepositoryResult>;
}
