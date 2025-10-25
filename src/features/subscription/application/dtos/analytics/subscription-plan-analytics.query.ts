import type {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';

export interface SubscriptionPlanAnalyticsQuery {
  readonly state?: SubscriptionPlanStatesEnum;
  readonly period?: SubscriptionPlanPeriodsEnum;
  readonly startDate?: Date;
  readonly endDate?: Date;
}
