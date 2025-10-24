import type { SubscriptionPlanAnalyticsQuery } from '../dtos/analytics/subscription-plan-analytics.query';
import type { SubscriptionPlanAnalyticsRepositoryResult } from '../dtos/analytics/subscription-plan-analytics.response';

export const SUBSCRIPTION_PLAN_ANALYTICS_REPOSITORY = Symbol(
  'SUBSCRIPTION_PLAN_ANALYTICS_REPOSITORY',
);

export interface SubscriptionPlanAnalyticsRepositoryPort {
  compute(
    query: SubscriptionPlanAnalyticsQuery,
  ): Promise<SubscriptionPlanAnalyticsRepositoryResult>;
}
