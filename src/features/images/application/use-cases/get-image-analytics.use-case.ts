import { Inject, Injectable } from '@nestjs/common';
import type { ImageAnalyticsQuery } from '../dto/analytics/image-analytics.query';
import type {
  ImageAnalyticsRepositoryResult,
  ImageAnalyticsResponse,
} from '../dto/analytics/image-analytics.response';
import {
  IMAGE_ANALYTICS_REPOSITORY,
  type ImageAnalyticsRepositoryPort,
} from '../ports/image-analytics.repository.port';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_WINDOW = 30;

@Injectable()
export class GetImageAnalyticsUseCase {
  constructor(
    @Inject(IMAGE_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: ImageAnalyticsRepositoryPort,
  ) {}

  async execute(query: ImageAnalyticsQuery): Promise<ImageAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    const uploadsTotal = analytics.uploadsByDate.reduce(
      (total, point) => total + point.count,
      0,
    );
    const averagePerEntity = this.calculateAveragePerEntity(analytics);
    const imagesLast30Days = this.countImagesLastWindow(analytics, DAYS_WINDOW);

    return {
      summary: {
        totalImages: analytics.totals.totalImages,
        uniqueEntities: analytics.totals.uniqueEntities,
        averageImagesPerEntity: averagePerEntity,
        imagesLast30Days,
      },
      uploads: {
        total: uploadsTotal,
        byDate: analytics.uploadsByDate,
      },
      entities: analytics.entityDistribution.map((entity) => ({
        entityId: entity.entityId,
        count: entity.count,
      })),
    };
  }

  private calculateAveragePerEntity(
    analytics: ImageAnalyticsRepositoryResult,
  ): number {
    if (analytics.totals.uniqueEntities === 0) {
      return 0;
    }

    return Number(
      (analytics.totals.totalImages / analytics.totals.uniqueEntities).toFixed(
        2,
      ),
    );
  }

  private countImagesLastWindow(
    analytics: ImageAnalyticsRepositoryResult,
    windowDays: number,
  ): number {
    if (!analytics.uploadsByDate.length) {
      return 0;
    }

    const cutoff = Date.now() - windowDays * MS_PER_DAY;

    return analytics.uploadsByDate.reduce((total, point) => {
      const date = new Date(point.date);
      if (Number.isNaN(date.getTime())) {
        return total;
      }
      if (date.getTime() >= cutoff) {
        return total + point.count;
      }
      return total;
    }, 0);
  }
}
