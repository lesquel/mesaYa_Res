import type { ReservationAnalyticsQuery } from '../dto/analytics/reservation-analytics.query';
import type { ReservationAnalyticsRepositoryResult } from '../dto/analytics/reservation-analytics.response';

export const RESERVATION_ANALYTICS_REPOSITORY = Symbol(
  'RESERVATION_ANALYTICS_REPOSITORY',
);

export interface ReservationAnalyticsRepositoryPort {
  compute(
    query: ReservationAnalyticsQuery,
  ): Promise<ReservationAnalyticsRepositoryResult>;
}
