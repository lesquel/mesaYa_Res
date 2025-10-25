import type { TableAnalyticsQuery } from '../dto/analytics/table-analytics.query';
import type { TableAnalyticsRepositoryResult } from '../dto/analytics/table-analytics.response';

export const TABLE_ANALYTICS_REPOSITORY = Symbol('TABLE_ANALYTICS_REPOSITORY');

export interface TableAnalyticsRepositoryPort {
  compute(query: TableAnalyticsQuery): Promise<TableAnalyticsRepositoryResult>;
}
