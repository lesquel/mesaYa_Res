import { Inject } from '@nestjs/common';
import type { DishAnalyticsQuery } from '../dtos/analytics/dish-analytics.query';
import type { DishAnalyticsResponse } from '../dtos/analytics/dish-analytics.response';
import {
  DISH_ANALYTICS_REPOSITORY,
  type DishAnalyticsRepositoryPort,
} from '../ports/dish-analytics.repository.port';

export class GetDishAnalyticsUseCase {
  constructor(
    @Inject(DISH_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: DishAnalyticsRepositoryPort,
  ) {}

  async execute(query: DishAnalyticsQuery): Promise<DishAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    return {
      summary: {
        totalDishes: analytics.totals.totalDishes,
        averagePrice: this.toRounded(analytics.totals.averagePrice),
        minPrice: this.toRounded(analytics.totals.minPrice),
        maxPrice: this.toRounded(analytics.totals.maxPrice),
        menusWithDishes: analytics.totals.menusWithDishes,
      },
      priceDistribution: analytics.priceDistribution.map((bucket) => ({
        bucket: bucket.bucket,
        count: bucket.count,
      })),
      restaurantDistribution: analytics.restaurantDistribution.map((item) => ({
        restaurantId: item.restaurantId,
        count: item.count,
      })),
      topDishes: analytics.topDishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        price: this.toRounded(dish.price),
        restaurantId: dish.restaurantId,
      })),
      creationTrend: analytics.creationTrend.map((point) => ({
        date: point.date,
        count: point.count,
        averagePrice: this.toRounded(point.averagePrice),
      })),
    };
  }

  private toRounded(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
