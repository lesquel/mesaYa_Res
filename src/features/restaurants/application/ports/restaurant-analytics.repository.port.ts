import type { RestaurantAnalyticsQuery } from '../dto/analytics/restaurant-analytics.query.js';
import type { RestaurantAnalyticsRepositoryResult } from '../dto/analytics/restaurant-analytics.response.js';

export const RESTAURANT_ANALYTICS_REPOSITORY = Symbol(
  'RESTAURANT_ANALYTICS_REPOSITORY',
);

export interface RestaurantAnalyticsRepositoryPort {
  compute(
    query: RestaurantAnalyticsQuery,
  ): Promise<RestaurantAnalyticsRepositoryResult>;
}
