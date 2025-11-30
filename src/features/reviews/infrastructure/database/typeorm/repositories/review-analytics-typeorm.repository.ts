import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import { toNumber } from '@shared/application/utils';
import type { ReviewAnalyticsQuery } from '../../../../application/dto/analytics/review-analytics.query';
import type {
  ReviewAnalyticsRepositoryResult,
  ReviewAnalyticsRepositoryTotals,
} from '../../../../application/dto/analytics/review-analytics.response';
import type { ReviewAnalyticsRepositoryPort } from '../../../../application/ports/review-analytics.repository.port';
import { ReviewOrmEntity } from '../orm';

interface ReviewTotalsRaw {
  totalReviews: string | number | null;
  averageRating: string | number | null;
  positiveReviews: string | number | null;
  neutralReviews: string | number | null;
  negativeReviews: string | number | null;
}

interface DistributionRaw {
  key: string | number | null;
  count: string | number | null;
}

interface TrendRaw {
  date: string;
  count: string | number | null;
  averageRating: string | number | null;
}

@Injectable()
export class ReviewAnalyticsTypeOrmRepository
  implements ReviewAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly repository: Repository<ReviewOrmEntity>,
  ) {}

  async compute(
    query: ReviewAnalyticsQuery,
  ): Promise<ReviewAnalyticsRepositoryResult> {
    const totalsPromise =
      this.buildTotalsQuery(query).getRawOne<ReviewTotalsRaw>();
    const ratingPromise =
      this.buildRatingDistributionQuery(query).getRawMany<DistributionRaw>();
    const restaurantPromise =
      this.buildRestaurantDistributionQuery(
        query,
      ).getRawMany<DistributionRaw>();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, ratingRaw, restaurantRaw, trendRaw] = await Promise.all([
      totalsPromise,
      ratingPromise,
      restaurantPromise,
      trendPromise,
    ]);

    const totals: ReviewAnalyticsRepositoryTotals = {
      totalReviews: toNumber(totalsRaw?.totalReviews),
      averageRating: toNumber(totalsRaw?.averageRating),
      positiveReviews: toNumber(totalsRaw?.positiveReviews),
      neutralReviews: toNumber(totalsRaw?.neutralReviews),
      negativeReviews: toNumber(totalsRaw?.negativeReviews),
    };

    return {
      totals,
      ratingDistribution: ratingRaw.map((row) => ({
        key: String(row.key ?? 'UNKNOWN'),
        count: toNumber(row.count),
      })),
      restaurantDistribution: restaurantRaw.map((row) => ({
        key: String(row.key ?? 'UNKNOWN'),
        count: toNumber(row.count),
      })),
      trend: trendRaw.map((row) => ({
        date: row.date,
        count: toNumber(row.count),
        averageRating: toNumber(row.averageRating),
      })),
    };
  }

  private buildTotalsQuery(
    filters: ReviewAnalyticsQuery,
  ): SelectQueryBuilder<ReviewOrmEntity> {
    const qb = this.repository.createQueryBuilder('review');

    this.applyFilters(qb, filters);

    qb.select('COUNT(review.id)', 'totalReviews')
      .addSelect('AVG(review.rating)', 'averageRating')
      .addSelect(
        'SUM(CASE WHEN review.rating >= 4 THEN 1 ELSE 0 END)',
        'positiveReviews',
      )
      .addSelect(
        'SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END)',
        'neutralReviews',
      )
      .addSelect(
        'SUM(CASE WHEN review.rating <= 2 THEN 1 ELSE 0 END)',
        'negativeReviews',
      );

    return qb;
  }

  private buildRatingDistributionQuery(
    filters: ReviewAnalyticsQuery,
  ): SelectQueryBuilder<ReviewOrmEntity> {
    const qb = this.repository.createQueryBuilder('review');

    this.applyFilters(qb, filters);

    qb.select('review.rating', 'key')
      .addSelect('COUNT(review.id)', 'count')
      .groupBy('review.rating')
      .orderBy('review.rating', 'ASC');

    return qb;
  }

  private buildRestaurantDistributionQuery(
    filters: ReviewAnalyticsQuery,
  ): SelectQueryBuilder<ReviewOrmEntity> {
    const qb = this.repository.createQueryBuilder('review');

    this.applyFilters(qb, filters);

    qb.select('review.restaurantId', 'key')
      .addSelect('COUNT(review.id)', 'count')
      .groupBy('review.restaurantId')
      .orderBy('COUNT(review.id)', 'DESC')
      .limit(10);

    return qb;
  }

  private buildTrendQuery(
    filters: ReviewAnalyticsQuery,
  ): SelectQueryBuilder<ReviewOrmEntity> {
    const qb = this.repository.createQueryBuilder('review');

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(review.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', review.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(review.id)', 'count')
      .addSelect('AVG(review.rating)', 'averageRating')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<ReviewOrmEntity>,
    filters: ReviewAnalyticsQuery,
  ): void {
    if (filters.restaurantId) {
      qb.andWhere('review.restaurantId = :restaurantId', {
        restaurantId: filters.restaurantId,
      });
    }

    if (filters.startDate) {
      qb.andWhere('review.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('review.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }
  }
}
