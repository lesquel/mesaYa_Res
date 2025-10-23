import type { SectionAnalyticsQuery } from '../dto/analytics/section-analytics.query';
import type { SectionAnalyticsRepositoryResult } from '../dto/analytics/section-analytics.response';

export const SECTION_ANALYTICS_REPOSITORY = Symbol(
  'SECTION_ANALYTICS_REPOSITORY',
);

export interface SectionAnalyticsRepositoryPort {
  compute(
    query: SectionAnalyticsQuery,
  ): Promise<SectionAnalyticsRepositoryResult>;
}
