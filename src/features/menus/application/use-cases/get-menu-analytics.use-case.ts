import { Inject, Injectable } from '@nestjs/common';
import type { MenuAnalyticsQuery } from '../dtos/analytics/menu-analytics.query';
import type { MenuAnalyticsResponse } from '../dtos/analytics/menu-analytics.response';
import {
  MENU_ANALYTICS_REPOSITORY,
  type MenuAnalyticsRepositoryPort,
} from '../ports/menu-analytics.repository.port';

@Injectable()
export class GetMenuAnalyticsUseCase {
  constructor(
    @Inject(MENU_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: MenuAnalyticsRepositoryPort,
  ) {}

  async execute(query: MenuAnalyticsQuery): Promise<MenuAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    const totalMenusTrend = analytics.menusByDate.reduce(
      (acc, point) => acc + point.count,
      0,
    );

    const priceRanges = analytics.priceDistribution.map((item) => ({
      label: this.resolveBucketLabel(item.bucket),
      count: item.count,
    }));

    return {
      summary: {
        totalMenus: analytics.totals.totalMenus,
        restaurantsWithMenus: analytics.totals.restaurantsWithMenus,
        averagePrice: Number(analytics.totals.averagePrice.toFixed(2)),
        minPrice: Number(analytics.totals.minPrice.toFixed(2)),
        maxPrice: Number(analytics.totals.maxPrice.toFixed(2)),
      },
      menus: {
        total: totalMenusTrend,
        byDate: analytics.menusByDate,
      },
      restaurants: analytics.menusByRestaurant.map((row) => ({
        restaurantId: row.restaurantId,
        count: row.count,
      })),
      priceRanges,
    };
  }

  private resolveBucketLabel(bucket: string): string {
    switch (bucket) {
      case 'LOW':
        return 'Menor a 10';
      case 'MEDIUM':
        return '10 a 19.99';
      case 'HIGH':
        return '20 a 29.99';
      case 'PREMIUM':
        return '30 a 49.99';
      case 'LUXURY':
        return '50 o más';
      default:
        return bucket;
    }
  }
}
