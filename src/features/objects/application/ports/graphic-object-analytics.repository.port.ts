import type { GraphicObjectAnalyticsQuery } from '../dto/analytics/graphic-object-analytics.query';
import type { GraphicObjectAnalyticsRepositoryResult } from '../dto/analytics/graphic-object-analytics.response';

export const GRAPHIC_OBJECT_ANALYTICS_REPOSITORY = Symbol(
  'GRAPHIC_OBJECT_ANALYTICS_REPOSITORY',
);

export interface GraphicObjectAnalyticsRepositoryPort {
  compute(
    query: GraphicObjectAnalyticsQuery,
  ): Promise<GraphicObjectAnalyticsRepositoryResult>;
}
