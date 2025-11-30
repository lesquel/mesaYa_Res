import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import { toNumber } from '@shared/application/utils';
import type { DishAnalyticsQuery } from '../../../../application/dtos/analytics/dish-analytics.query';
import type {
  DishAnalyticsRepositoryResult,
  DishAnalyticsRepositoryTotals,
} from '../../../../application/dtos/analytics/dish-analytics.response';
import type { DishAnalyticsRepositoryPort } from '../../../../application/ports/dish-analytics.repository.port';
import { DishOrmEntity } from '../orm/index';

interface DishTotalsRaw {
  totalDishes: string | number | null;
  averagePrice: string | number | null;
  minPrice: string | number | null;
  maxPrice: string | number | null;
  menusWithDishes: string | number | null;
}

interface PriceBucketRaw {
  bucket: string;
  count: string | number | null;
}

interface RestaurantDistributionRaw {
  restaurantId: string | null;
  count: string | number | null;
}

interface TopDishRaw {
  id: string;
  name: string;
  price: string | number | null;
  restaurantId: string | number | null;
}

interface TrendRaw {
  date: string;
  count: string | number | null;
  averagePrice: string | number | null;
}

@Injectable()
export class DishAnalyticsTypeOrmRepository
  implements DishAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(DishOrmEntity)
    private readonly repository: Repository<DishOrmEntity>,
  ) {}

  async compute(
    query: DishAnalyticsQuery,
  ): Promise<DishAnalyticsRepositoryResult> {
    const totalsPromise =
      this.buildTotalsQuery(query).getRawOne<DishTotalsRaw>();
    const pricePromise =
      this.buildPriceDistributionQuery(query).getRawMany<PriceBucketRaw>();
    const restaurantPromise =
      this.buildRestaurantDistributionQuery(
        query,
      ).getRawMany<RestaurantDistributionRaw>();
    const topDishesPromise =
      this.buildTopDishesQuery(query).getRawMany<TopDishRaw>();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, priceRaw, restaurantRaw, topDishesRaw, trendRaw] =
      await Promise.all([
        totalsPromise,
        pricePromise,
        restaurantPromise,
        topDishesPromise,
        trendPromise,
      ]);

    const totals: DishAnalyticsRepositoryTotals = {
      totalDishes: toNumber(totalsRaw?.totalDishes),
      averagePrice: toNumber(totalsRaw?.averagePrice),
      minPrice: toNumber(totalsRaw?.minPrice),
      maxPrice: toNumber(totalsRaw?.maxPrice),
      menusWithDishes: toNumber(totalsRaw?.menusWithDishes),
    };

    return {
      totals,
      priceDistribution: priceRaw.map((bucket) => ({
        bucket: bucket.bucket,
        count: toNumber(bucket.count),
      })),
      restaurantDistribution: restaurantRaw.map((row) => ({
        restaurantId: row.restaurantId ?? '',
        count: toNumber(row.count),
      })),
      topDishes: topDishesRaw.map((row) => ({
        id: row.id,
        name: row.name,
        price: toNumber(row.price),
        restaurantId: String(row.restaurantId ?? ''),
      })),
      creationTrend: trendRaw.map((row) => ({
        date: row.date,
        count: toNumber(row.count),
        averagePrice: toNumber(row.averagePrice),
      })),
    };
  }

  private buildTotalsQuery(
    filters: DishAnalyticsQuery,
  ): SelectQueryBuilder<DishOrmEntity> {
    const qb = this.repository.createQueryBuilder('dish');

    this.applyFilters(qb, filters);

    qb.select('COUNT(dish.id)', 'totalDishes')
      .addSelect('AVG(dish.price)', 'averagePrice')
      .addSelect('MIN(dish.price)', 'minPrice')
      .addSelect('MAX(dish.price)', 'maxPrice')
      .addSelect('COUNT(DISTINCT dish.menuId)', 'menusWithDishes');

    return qb;
  }

  private buildPriceDistributionQuery(
    filters: DishAnalyticsQuery,
  ): SelectQueryBuilder<DishOrmEntity> {
    const qb = this.repository.createQueryBuilder('dish');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN dish.price < 10 THEN 'BUDGET'
        WHEN dish.price < 25 THEN 'STANDARD'
        WHEN dish.price < 50 THEN 'PREMIUM'
        ELSE 'GOURMET'
      END`,
      'bucket',
    )
      .addSelect('COUNT(dish.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildRestaurantDistributionQuery(
    filters: DishAnalyticsQuery,
  ): SelectQueryBuilder<DishOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('dish')
      .select('dish.restaurantId', 'restaurantId')
      .addSelect('COUNT(dish.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('dish.restaurantId').orderBy('COUNT(dish.id)', 'DESC').limit(10);

    return qb;
  }

  private buildTopDishesQuery(
    filters: DishAnalyticsQuery,
  ): SelectQueryBuilder<DishOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('dish')
      .select(['dish.id AS id', 'dish.name AS name'])
      .addSelect('dish.price', 'price')
      .addSelect('dish.restaurantId', 'restaurantId');

    this.applyFilters(qb, filters);

    qb.orderBy('dish.price', 'DESC').limit(5);

    return qb;
  }

  private buildTrendQuery(
    filters: DishAnalyticsQuery,
  ): SelectQueryBuilder<DishOrmEntity> {
    const qb = this.repository.createQueryBuilder('dish');

    this.applyFilters(qb, filters);

    const dialect = this.repository.manager.connection.options.type;
    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(dish.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', dish.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(dish.id)', 'count')
      .addSelect('AVG(dish.price)', 'averagePrice')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<DishOrmEntity>,
    filters: DishAnalyticsQuery,
  ): void {
    if (typeof filters.restaurantId === 'number') {
      qb.andWhere('dish.restaurantId = :restaurantId', {
        restaurantId: filters.restaurantId,
      });
    }

    if (filters.menuId) {
      qb.andWhere('dish.menuId = :menuId', { menuId: filters.menuId });
    }

    if (filters.startDate) {
      qb.andWhere('dish.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('dish.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }
  }
}
