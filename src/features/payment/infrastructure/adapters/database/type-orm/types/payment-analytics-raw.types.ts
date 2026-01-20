/**
 * Payment Analytics Raw Types
 *
 * Raw result types from TypeORM queries for payment analytics.
 * These types represent the raw database results before transformation.
 */

import type {
  PaymentStatusEnum,
  PaymentTypeEnum,
} from '@features/payment/domain/enums';

/**
 * Raw totals result from the aggregation query.
 * Values may be strings due to PostgreSQL's handling of aggregate functions.
 */
export interface TotalsRaw {
  totalPayments: string | number | null;
  totalAmount: string | number | null;
  averageAmount: string | number | null;
  completedPayments: string | number | null;
  pendingPayments: string | number | null;
  cancelledPayments: string | number | null;
  minAmount: string | number | null;
  maxAmount: string | number | null;
}

/**
 * Raw status distribution result from the GROUP BY query.
 */
export interface StatusDistributionRaw {
  status: PaymentStatusEnum;
  count: string | number | null;
}

/**
 * Raw type distribution result from the GROUP BY query.
 */
export interface TypeDistributionRaw {
  type: PaymentTypeEnum;
  count: string | number | null;
  amount: string | number | null;
}

/**
 * Raw restaurant distribution result from the GROUP BY query.
 */
export interface RestaurantDistributionRaw {
  restaurantId: string;
  count: string | number | null;
  amount: string | number | null;
}

/**
 * Raw revenue trend result from the time-series query.
 */
export interface RevenueTrendRaw {
  date: string;
  count: string | number | null;
  amount: string | number | null;
}
