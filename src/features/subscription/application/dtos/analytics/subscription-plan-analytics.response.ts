import type {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';

export interface SubscriptionPlanAnalyticsSummary {
  readonly totalPlans: number;
  readonly activePlans: number;
  readonly inactivePlans: number;
  readonly averagePrice: number;
  readonly minPrice: number;
  readonly maxPrice: number;
}

export interface SubscriptionPlanAnalyticsPriceBucket {
  readonly bucket: string;
  readonly count: number;
}

export interface SubscriptionPlanAnalyticsPeriodDistribution {
  readonly period: SubscriptionPlanPeriodsEnum;
  readonly count: number;
}

export interface SubscriptionPlanAnalyticsStateDistribution {
  readonly state: SubscriptionPlanStatesEnum;
  readonly count: number;
}

export interface SubscriptionPlanAnalyticsUsage {
  readonly planId: string;
  readonly planName: string;
  readonly price: number;
  readonly subscriptions: number;
  readonly activeSubscriptions: number;
  readonly revenue: number;
}

export interface SubscriptionPlanAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
  readonly averagePrice: number;
}

export interface SubscriptionPlanAnalyticsResponse {
  readonly summary: SubscriptionPlanAnalyticsSummary;
  readonly priceDistribution: SubscriptionPlanAnalyticsPriceBucket[];
  readonly periodDistribution: SubscriptionPlanAnalyticsPeriodDistribution[];
  readonly stateDistribution: SubscriptionPlanAnalyticsStateDistribution[];
  readonly subscriptionUsage: SubscriptionPlanAnalyticsUsage[];
  readonly creationTrend: SubscriptionPlanAnalyticsTrendPoint[];
}

export interface SubscriptionPlanAnalyticsRepositoryTotals {
  readonly totalPlans: number;
  readonly activePlans: number;
  readonly inactivePlans: number;
  readonly averagePrice: number;
  readonly minPrice: number;
  readonly maxPrice: number;
}

export interface SubscriptionPlanAnalyticsRepositoryResult {
  readonly totals: SubscriptionPlanAnalyticsRepositoryTotals;
  readonly priceDistribution: SubscriptionPlanAnalyticsPriceBucket[];
  readonly periodDistribution: SubscriptionPlanAnalyticsPeriodDistribution[];
  readonly stateDistribution: SubscriptionPlanAnalyticsStateDistribution[];
  readonly subscriptionUsage: SubscriptionPlanAnalyticsUsage[];
  readonly creationTrend: SubscriptionPlanAnalyticsTrendPoint[];
}
