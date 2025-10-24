import type {
  SubscriptionPlanPeriodsEnum,
  SubscriptionStatesEnum,
} from '@features/subscription/domain/enums';

export interface SubscriptionAnalyticsQuery {
  readonly subscriptionPlanId?: string;
  readonly restaurantId?: string;
  readonly state?: SubscriptionStatesEnum;
  readonly subscriptionPeriod?: SubscriptionPlanPeriodsEnum;
  readonly startDate?: Date;
  readonly endDate?: Date;
}
