import { Inject, Injectable } from '@nestjs/common';
import { toRounded } from '@shared/application/utils';
import type { GraphicObjectAnalyticsQuery } from '../dto/analytics/graphic-object-analytics.query';
import type {
  GraphicObjectAnalyticsResponse,
  GraphicObjectAnalyticsRepositoryResult,
} from '../dto/analytics/graphic-object-analytics.response';
import {
  GRAPHIC_OBJECT_ANALYTICS_REPOSITORY,
  type GraphicObjectAnalyticsRepositoryPort,
} from '../ports/graphic-object-analytics.repository.port';

const DAYS_WINDOW = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class GetGraphicObjectAnalyticsUseCase {
  constructor(
    @Inject(GRAPHIC_OBJECT_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: GraphicObjectAnalyticsRepositoryPort,
  ) {}

  async execute(
    query: GraphicObjectAnalyticsQuery,
  ): Promise<GraphicObjectAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    const trendTotal = analytics.objectsByDate.reduce(
      (sum, point) => sum + point.count,
      0,
    );
    const objectsLast30Days = this.countObjectsLastWindow(analytics);

    return {
      summary: {
        totalObjects: analytics.totals.totalObjects,
        uniqueImages: analytics.totals.uniqueImages,
        averageWidth: toRounded(analytics.totals.averageWidth),
        averageHeight: toRounded(analytics.totals.averageHeight),
        averageArea: toRounded(analytics.totals.averageArea),
        averagePositionX: toRounded(analytics.totals.averagePositionX),
        averagePositionY: toRounded(analytics.totals.averagePositionY),
        objectsLast30Days,
      },
      objects: {
        total: trendTotal,
        byDate: analytics.objectsByDate,
      },
      images: analytics.objectsByImage.map((row) => ({
        imageId: row.imageId,
        count: row.count,
      })),
      sizeBuckets: analytics.sizeDistribution.map((row) => ({
        bucket: this.resolveSizeBucketLabel(row.bucket),
        count: row.count,
      })),
      orientations: analytics.orientationDistribution.map((row) => ({
        orientation: this.resolveOrientationLabel(row.orientation),
        count: row.count,
      })),
    };
  }

  private countObjectsLastWindow(
    analytics: GraphicObjectAnalyticsRepositoryResult,
  ): number {
    if (!analytics.objectsByDate.length) {
      return 0;
    }

    const cutoff = Date.now() - DAYS_WINDOW * MS_PER_DAY;

    return analytics.objectsByDate.reduce((total, point) => {
      const parsed = new Date(point.date);
      if (Number.isNaN(parsed.getTime())) {
        return total;
      }
      return parsed.getTime() >= cutoff ? total + point.count : total;
    }, 0);
  }

  private resolveSizeBucketLabel(bucket: string): string {
    switch (bucket) {
      case 'SMALL':
        return 'Área menor a 10k';
      case 'MEDIUM':
        return 'Área entre 10k y 39k';
      case 'LARGE':
        return 'Área entre 40k y 89k';
      case 'HUGE':
        return 'Área mayor o igual a 90k';
      default:
        return bucket;
    }
  }

  private resolveOrientationLabel(orientation: string): string {
    switch (orientation) {
      case 'LANDSCAPE':
        return 'Horizontal';
      case 'PORTRAIT':
        return 'Vertical';
      case 'SQUARE':
        return 'Cuadrado';
      default:
        return orientation;
    }
  }
}
