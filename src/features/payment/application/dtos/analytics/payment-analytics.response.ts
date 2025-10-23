import type { PaymentStatusEnum, PaymentTypeEnum } from '../../../domain/enums';

export interface PaymentAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
  readonly amount: number;
}

export interface PaymentAnalyticsSummary {
  readonly totalPayments: number;
  readonly totalAmount: number;
  readonly averageAmount: number;
  readonly completedPayments: number;
  readonly pendingPayments: number;
  readonly cancelledPayments: number;
  readonly completionRate: number;
  readonly minAmount: number;
  readonly maxAmount: number;
}

export interface PaymentAnalyticsResponse {
  readonly summary: PaymentAnalyticsSummary;
  readonly revenue: {
    readonly totalAmount: number;
    readonly totalPayments: number;
    readonly byDate: PaymentAnalyticsTrendPoint[];
  };
  readonly statuses: Array<{
    readonly status: PaymentStatusEnum;
    readonly count: number;
  }>;
  readonly types: Array<{
    readonly type: PaymentTypeEnum;
    readonly count: number;
    readonly amount: number;
  }>;
  readonly topRestaurants: Array<{
    readonly restaurantId: string;
    readonly count: number;
    readonly amount: number;
  }>;
}

export interface PaymentAnalyticsRepositoryTotals {
  readonly totalPayments: number;
  readonly totalAmount: number;
  readonly averageAmount: number;
  readonly completedPayments: number;
  readonly pendingPayments: number;
  readonly cancelledPayments: number;
  readonly minAmount: number;
  readonly maxAmount: number;
}

export interface PaymentAnalyticsRepositoryResult {
  readonly totals: PaymentAnalyticsRepositoryTotals;
  readonly revenueByDate: PaymentAnalyticsTrendPoint[];
  readonly statusDistribution: Array<{
    status: PaymentStatusEnum;
    count: number;
  }>;
  readonly typeDistribution: Array<{
    type: PaymentTypeEnum;
    count: number;
    amount: number;
  }>;
  readonly restaurantDistribution: Array<{
    restaurantId: string;
    count: number;
    amount: number;
  }>;
}
