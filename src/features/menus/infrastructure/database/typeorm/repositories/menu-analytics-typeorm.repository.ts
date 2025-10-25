import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import type { MenuAnalyticsQuery } from '../../../../application/dtos/analytics/menu-analytics.query';
import type {
  MenuAnalyticsRepositoryResult,
  MenuAnalyticsTrendPoint,
} from '../../../../application/dtos/analytics/menu-analytics.response';
import type { MenuAnalyticsRepositoryPort } from '../../../../application/ports/menu-analytics.repository.port';
import { MenuOrmEntity } from '../orm/index.js';

type TotalsRaw = {
  totalMenus: string | number | null;
  restaurantsWithMenus: string | number | null;
  averagePrice: string | number | null;
  minPrice: string | number | null;
  maxPrice: string | number | null;
};

type RestaurantDistributionRaw = {
  restaurantId: number;
  count: string | number | null;
};

type PriceDistributionRaw = {
  bucket: string;
  count: string | number | null;
};

type TrendRaw = {
  date: string;
  count: string | number | null;
};

@Injectable()
export class MenuAnalyticsTypeOrmRepository
  implements MenuAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(MenuOrmEntity)
    private readonly repository: Repository<MenuOrmEntity>,
  ) {}

  async compute(
    query: MenuAnalyticsQuery,
  ): Promise<MenuAnalyticsRepositoryResult> {
    const totalsPromise = this.buildTotalsQuery(query).getRawOne<TotalsRaw>();
    const restaurantsPromise =
      this.buildRestaurantsDistributionQuery(
        query,
      ).getRawMany<RestaurantDistributionRaw>();
    const priceDistributionPromise =
      this.buildPriceDistributionQuery(
        query,
      ).getRawMany<PriceDistributionRaw>();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, restaurantsRaw, priceRaw, trendRaw] = await Promise.all([
      totalsPromise,
      restaurantsPromise,
      priceDistributionPromise,
      trendPromise,
    ]);

    return {
      totals: {
        totalMenus: this.toNumber(totalsRaw?.totalMenus),
        restaurantsWithMenus: this.toNumber(totalsRaw?.restaurantsWithMenus),
        averagePrice: this.toNumber(totalsRaw?.averagePrice),
        minPrice: this.toNumber(totalsRaw?.minPrice),
        maxPrice: this.toNumber(totalsRaw?.maxPrice),
      },
      menusByRestaurant: restaurantsRaw.map((row) => ({
        restaurantId: row.restaurantId,
        count: this.toNumber(row.count),
      })),
      priceDistribution: priceRaw.map((row) => ({
        bucket: row.bucket,
        count: this.toNumber(row.count),
      })),
      menusByDate: trendRaw.map<MenuAnalyticsTrendPoint>((row) => ({
        date: row.date,
        count: this.toNumber(row.count),
      })),
    };
  }

  private buildTotalsQuery(
    filters: MenuAnalyticsQuery,
  ): SelectQueryBuilder<MenuOrmEntity> {
    const qb = this.repository.createQueryBuilder('menu');

    this.applyFilters(qb, filters);

    qb.select('COUNT(menu.id)', 'totalMenus')
      .addSelect('COUNT(DISTINCT menu.restaurantId)', 'restaurantsWithMenus')
      .addSelect('AVG(menu.price)', 'averagePrice')
      .addSelect('MIN(menu.price)', 'minPrice')
      .addSelect('MAX(menu.price)', 'maxPrice');

    return qb;
  }

  private buildRestaurantsDistributionQuery(
    filters: MenuAnalyticsQuery,
  ): SelectQueryBuilder<MenuOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('menu')
      .select('menu.restaurantId', 'restaurantId')
      .addSelect('COUNT(menu.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('menu.restaurantId').orderBy('count', 'DESC');

    return qb;
  }

  private buildPriceDistributionQuery(
    filters: MenuAnalyticsQuery,
  ): SelectQueryBuilder<MenuOrmEntity> {
    const qb = this.repository.createQueryBuilder('menu');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN menu.price < 10 THEN 'LOW'
        WHEN menu.price >= 10 AND menu.price < 20 THEN 'MEDIUM'
        WHEN menu.price >= 20 AND menu.price < 30 THEN 'HIGH'
        WHEN menu.price >= 30 AND menu.price < 50 THEN 'PREMIUM'
        ELSE 'LUXURY'
      END`,
      'bucket',
    )
      .addSelect('COUNT(menu.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildTrendQuery(
    filters: MenuAnalyticsQuery,
  ): SelectQueryBuilder<MenuOrmEntity> {
    const qb = this.repository.createQueryBuilder('menu');

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(menu.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', menu.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(menu.id)', 'count')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<MenuOrmEntity>,
    filters: MenuAnalyticsQuery,
  ): void {
    if (filters.startDate) {
      qb.andWhere('menu.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('menu.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (typeof filters.restaurantId === 'number') {
      qb.andWhere('menu.restaurantId = :restaurantId', {
        restaurantId: filters.restaurantId,
      });
    }

    if (typeof filters.minPrice === 'number') {
      qb.andWhere('menu.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (typeof filters.maxPrice === 'number') {
      qb.andWhere('menu.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }
  }

  private toNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isNaN(value) ? 0 : value;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
