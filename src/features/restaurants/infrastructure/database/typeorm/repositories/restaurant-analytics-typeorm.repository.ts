import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import type { RestaurantAnalyticsQuery } from '../../../../application/dto/analytics/restaurant-analytics.query';
import type {
  RestaurantAnalyticsRepositoryResult,
  RestaurantAnalyticsRepositoryTotals,
  RestaurantAnalyticsTrendPoint,
} from '../../../../application/dto/analytics/restaurant-analytics.response';
import type { RestaurantAnalyticsRepositoryPort } from '../../../../application/ports/restaurant-analytics.repository.port';
import { RestaurantOrmEntity } from '../../typeorm/orm/restaurant.orm-entity';

interface RestaurantTotalsRaw {
  totalRestaurants: string | number | null;
  activeRestaurants: string | number | null;
  inactiveRestaurants: string | number | null;
  averageCapacity: string | number | null;
}

interface CapacityBucketRaw {
  bucket: string;
  count: string | number | null;
}

interface DistributionRaw<K = string | number | null> {
  key: K;
  count: string | number | null;
}

interface TrendRaw {
  date: string;
  count: string | number | null;
}

@Injectable()
export class RestaurantAnalyticsTypeOrmRepository
  implements RestaurantAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly repository: Repository<RestaurantOrmEntity>,
  ) {}

  async compute(
    query: RestaurantAnalyticsQuery,
  ): Promise<RestaurantAnalyticsRepositoryResult> {
    const totalsPromise =
      this.buildTotalsQuery(query).getRawOne<RestaurantTotalsRaw>();
    const capacityPromise =
      this.buildCapacityQuery(query).getRawMany<CapacityBucketRaw>();
    const locationPromise =
      this.buildLocationDistributionQuery(query).getRawMany<
        DistributionRaw<string>
      >();
    const ownerPromise =
      this.buildOwnerDistributionQuery(query).getRawMany<
        DistributionRaw<string | null>
      >();
    const subscriptionPromise =
      this.buildSubscriptionDistributionQuery(query).getRawMany<
        DistributionRaw<number>
      >();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [
      totalsRaw,
      capacityRaw,
      locationRaw,
      ownerRaw,
      subscriptionRaw,
      trendRaw,
    ] = await Promise.all([
      totalsPromise,
      capacityPromise,
      locationPromise,
      ownerPromise,
      subscriptionPromise,
      trendPromise,
    ]);

    const totals: RestaurantAnalyticsRepositoryTotals = {
      totalRestaurants: this.toNumber(totalsRaw?.totalRestaurants),
      activeRestaurants: this.toNumber(totalsRaw?.activeRestaurants),
      inactiveRestaurants: this.toNumber(totalsRaw?.inactiveRestaurants),
      averageCapacity: this.toNumber(totalsRaw?.averageCapacity),
    };

    return {
      totals,
      capacityDistribution: capacityRaw.map((row) => ({
        bucket: row.bucket,
        count: this.toNumber(row.count),
      })),
      locationDistribution: locationRaw.map((row) => ({
        key: row.key ?? 'UNKNOWN',
        count: this.toNumber(row.count),
      })),
      ownerDistribution: ownerRaw.map((row) => ({
        key: row.key,
        count: this.toNumber(row.count),
      })),
      subscriptionDistribution: subscriptionRaw.map((row) => ({
        key: row.key,
        count: this.toNumber(row.count),
      })),
      creationTrend: trendRaw.map<RestaurantAnalyticsTrendPoint>((row) => ({
        date: row.date,
        count: this.toNumber(row.count),
      })),
    };
  }

  private buildTotalsQuery(
    filters: RestaurantAnalyticsQuery,
  ): SelectQueryBuilder<RestaurantOrmEntity> {
    const qb = this.repository.createQueryBuilder('restaurant');

    this.applyFilters(qb, filters);

    qb.select('COUNT(restaurant.id)', 'totalRestaurants')
      .addSelect(
        'SUM(CASE WHEN restaurant.active = true THEN 1 ELSE 0 END)',
        'activeRestaurants',
      )
      .addSelect(
        'SUM(CASE WHEN restaurant.active = false THEN 1 ELSE 0 END)',
        'inactiveRestaurants',
      )
      .addSelect('AVG(restaurant.totalCapacity)', 'averageCapacity');

    return qb;
  }

  private buildCapacityQuery(
    filters: RestaurantAnalyticsQuery,
  ): SelectQueryBuilder<RestaurantOrmEntity> {
    const qb = this.repository.createQueryBuilder('restaurant');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN restaurant.totalCapacity < 50 THEN 'SMALL'
        WHEN restaurant.totalCapacity < 100 THEN 'MEDIUM'
        ELSE 'LARGE'
      END`,
      'bucket',
    )
      .addSelect('COUNT(restaurant.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildLocationDistributionQuery(
    filters: RestaurantAnalyticsQuery,
  ): SelectQueryBuilder<RestaurantOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('restaurant')
      .select('restaurant.location', 'key')
      .addSelect('COUNT(restaurant.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('restaurant.location')
      .orderBy('COUNT(restaurant.id)', 'DESC')
      .limit(10);

    return qb;
  }

  private buildOwnerDistributionQuery(
    filters: RestaurantAnalyticsQuery,
  ): SelectQueryBuilder<RestaurantOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('restaurant')
      .select('restaurant.ownerId', 'key')
      .addSelect('COUNT(restaurant.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('restaurant.ownerId')
      .orderBy('COUNT(restaurant.id)', 'DESC')
      .limit(10);

    return qb;
  }

  private buildSubscriptionDistributionQuery(
    filters: RestaurantAnalyticsQuery,
  ): SelectQueryBuilder<RestaurantOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('restaurant')
      .select('restaurant.subscriptionId', 'key')
      .addSelect('COUNT(restaurant.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('restaurant.subscriptionId').orderBy(
      'COUNT(restaurant.id)',
      'DESC',
    );

    return qb;
  }

  private buildTrendQuery(
    filters: RestaurantAnalyticsQuery,
  ): SelectQueryBuilder<RestaurantOrmEntity> {
    const qb = this.repository.createQueryBuilder('restaurant');

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(restaurant.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', restaurant.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(restaurant.id)', 'count')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<RestaurantOrmEntity>,
    filters: RestaurantAnalyticsQuery,
  ): void {
    if (filters.startDate) {
      qb.andWhere('restaurant.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('restaurant.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.active !== undefined) {
      qb.andWhere('restaurant.active = :active', {
        active: filters.active,
      });
    }

    if (filters.ownerId) {
      qb.andWhere('restaurant.ownerId = :ownerId', {
        ownerId: filters.ownerId,
      });
    }

    if (typeof filters.subscriptionId === 'number') {
      qb.andWhere('restaurant.subscriptionId = :subscriptionId', {
        subscriptionId: filters.subscriptionId,
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
