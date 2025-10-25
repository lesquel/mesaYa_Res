import type { ImageAnalyticsQuery } from '../dto/analytics/image-analytics.query';
import type { ImageAnalyticsRepositoryResult } from '../dto/analytics/image-analytics.response';

export const IMAGE_ANALYTICS_REPOSITORY = Symbol('IMAGE_ANALYTICS_REPOSITORY');

export interface ImageAnalyticsRepositoryPort {
  compute(query: ImageAnalyticsQuery): Promise<ImageAnalyticsRepositoryResult>;
}
