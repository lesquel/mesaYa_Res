import type { MenuAnalyticsQuery } from '../dtos/analytics/menu-analytics.query';
import type { MenuAnalyticsRepositoryResult } from '../dtos/analytics/menu-analytics.response';

export const MENU_ANALYTICS_REPOSITORY = Symbol('MENU_ANALYTICS_REPOSITORY');

export interface MenuAnalyticsRepositoryPort {
  compute(query: MenuAnalyticsQuery): Promise<MenuAnalyticsRepositoryResult>;
}
