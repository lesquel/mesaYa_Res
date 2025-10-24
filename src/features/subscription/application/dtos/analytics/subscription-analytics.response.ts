import type {
  SubscriptionPlanPeriodsEnum,
  SubscriptionStatesEnum,
} from '@features/subscription/domain/enums';

export interface SubscriptionAnalyticsSummary {
  readonly totalSubscriptions: number;
  readonly activeSubscriptions: number;
  readonly inactiveSubscriptions: number;
  readonly totalRevenue: number;
  readonly averageRevenuePerSubscription: number;
  readonly uniqueRestaurants: number;
}

export interface SubscriptionAnalyticsStateDistribution {
  readonly state: SubscriptionStatesEnum;
  readonly count: number;
}

export interface SubscriptionAnalyticsPlanPerformance {
  readonly planId: string;
  readonly planName: string;
  readonly price: number;
  readonly subscriptions: number;
  readonly activeSubscriptions: number;
  readonly revenue: number;
}

export interface SubscriptionAnalyticsPeriodDistribution {
  readonly period: SubscriptionPlanPeriodsEnum;
  readonly count: number;
  readonly revenue: number;
}

export interface SubscriptionAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
  readonly revenue: number;
}

export interface SubscriptionAnalyticsResponse {
  readonly summary: SubscriptionAnalyticsSummary;
  readonly stateDistribution: SubscriptionAnalyticsStateDistribution[];
  readonly planPerformance: SubscriptionAnalyticsPlanPerformance[];
  readonly periodDistribution: SubscriptionAnalyticsPeriodDistribution[];
  readonly activationTrend: SubscriptionAnalyticsTrendPoint[];
}

export interface SubscriptionAnalyticsRepositoryTotals {
  readonly totalSubscriptions: number;
  readonly activeSubscriptions: number;
  readonly inactiveSubscriptions: number;
  readonly totalRevenue: number;
  readonly uniqueRestaurants: number;
}

export interface SubscriptionAnalyticsRepositoryResult {
  readonly totals: SubscriptionAnalyticsRepositoryTotals;
  readonly stateDistribution: SubscriptionAnalyticsStateDistribution[];
  readonly planPerformance: SubscriptionAnalyticsPlanPerformance[];
  readonly periodDistribution: SubscriptionAnalyticsPeriodDistribution[];
  readonly activationTrend: SubscriptionAnalyticsTrendPoint[];
}
