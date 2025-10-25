import type { DishAnalyticsQuery } from '../dtos/analytics/dish-analytics.query';
import type { DishAnalyticsRepositoryResult } from '../dtos/analytics/dish-analytics.response';

export const DISH_ANALYTICS_REPOSITORY = Symbol('DISH_ANALYTICS_REPOSITORY');

export interface DishAnalyticsRepositoryPort {
  compute(query: DishAnalyticsQuery): Promise<DishAnalyticsRepositoryResult>;
}
