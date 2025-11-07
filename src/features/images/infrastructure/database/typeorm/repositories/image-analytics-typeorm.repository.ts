import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import type { ImageAnalyticsQuery } from '../../../../application/dto/analytics/image-analytics.query';
import type {
  ImageAnalyticsRepositoryResult,
  ImageAnalyticsTrendPoint,
} from '../../../../application/dto/analytics/image-analytics.response';
import type { ImageAnalyticsRepositoryPort } from '../../../../application/ports/image-analytics.repository.port';
import { ImageOrmEntity } from '../orm/index.js';

type TotalsRaw = {
  totalImages: string | number | null;
  uniqueEntities: string | number | null;
};

type EntityDistributionRaw = {
  entityId: string;
  count: string | number | null;
};

type TrendRaw = {
  date: string;
  count: string | number | null;
};

@Injectable()
export class ImageAnalyticsTypeOrmRepository
  implements ImageAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(ImageOrmEntity)
    private readonly repository: Repository<ImageOrmEntity>,
  ) {}

  async compute(
    query: ImageAnalyticsQuery,
  ): Promise<ImageAnalyticsRepositoryResult> {
    const totalsPromise = this.buildTotalsQuery(query).getRawOne<TotalsRaw>();
    const entitiesPromise =
      this.buildEntitiesDistributionQuery(
        query,
      ).getRawMany<EntityDistributionRaw>();
    const trendPromise =
      this.buildUploadsTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, entitiesRaw, trendRaw] = await Promise.all([
      totalsPromise,
      entitiesPromise,
      trendPromise,
    ]);

    return {
      totals: {
        totalImages: this.toNumber(totalsRaw?.totalImages),
        uniqueEntities: this.toNumber(totalsRaw?.uniqueEntities),
      },
      entityDistribution: entitiesRaw.map((row) => ({
        entityId: row.entityId,
        count: this.toNumber(row.count),
      })),
      uploadsByDate: trendRaw.map<ImageAnalyticsTrendPoint>((row) => ({
        date: row.date,
        count: this.toNumber(row.count),
      })),
    };
  }

  private buildTotalsQuery(
    filters: ImageAnalyticsQuery,
  ): SelectQueryBuilder<ImageOrmEntity> {
    const qb = this.repository.createQueryBuilder('image');

    this.applyFilters(qb, filters);

    qb.select('COUNT(image.id)', 'totalImages').addSelect(
      'COUNT(DISTINCT image.entityId)',
      'uniqueEntities',
    );

    return qb;
  }

  private buildEntitiesDistributionQuery(
    filters: ImageAnalyticsQuery,
  ): SelectQueryBuilder<ImageOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('image')
      .select('image.entityId', 'entityId')
      .addSelect('COUNT(image.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('image.entityId').orderBy('count', 'DESC');

    return qb;
  }

  private buildUploadsTrendQuery(
    filters: ImageAnalyticsQuery,
  ): SelectQueryBuilder<ImageOrmEntity> {
    const qb = this.repository.createQueryBuilder('image');

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(image.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', image.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(image.id)', 'count')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<ImageOrmEntity>,
    filters: ImageAnalyticsQuery,
  ): void {
    if (filters.startDate) {
      qb.andWhere('image.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('image.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (typeof filters.entityId === 'string' && filters.entityId.length > 0) {
      qb.andWhere('image.entityId = :entityId', {
        entityId: filters.entityId,
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
