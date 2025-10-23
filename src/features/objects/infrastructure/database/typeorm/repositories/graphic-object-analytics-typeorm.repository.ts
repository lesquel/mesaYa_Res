import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import type { GraphicObjectAnalyticsQuery } from '../../../../application/dto/analytics/graphic-object-analytics.query';
import type {
  GraphicObjectAnalyticsRepositoryResult,
  GraphicObjectAnalyticsTrendPoint,
} from '../../../../application/dto/analytics/graphic-object-analytics.response';
import type { GraphicObjectAnalyticsRepositoryPort } from '../../../../application/ports/graphic-object-analytics.repository.port';
import { GraphicObjectOrmEntity } from '../orm/index.js';

interface TotalsRaw {
  totalObjects: string | number | null;
  uniqueImages: string | number | null;
  averageWidth: string | number | null;
  averageHeight: string | number | null;
  averageArea: string | number | null;
  averagePositionX: string | number | null;
  averagePositionY: string | number | null;
}

interface ImageDistributionRaw {
  imageId: number;
  count: string | number | null;
}

interface SizeDistributionRaw {
  bucket: string;
  count: string | number | null;
}

interface OrientationDistributionRaw {
  orientation: string;
  count: string | number | null;
}

interface TrendRaw {
  date: string;
  count: string | number | null;
}

@Injectable()
export class GraphicObjectAnalyticsTypeOrmRepository
  implements GraphicObjectAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(GraphicObjectOrmEntity)
    private readonly repository: Repository<GraphicObjectOrmEntity>,
  ) {}

  async compute(
    query: GraphicObjectAnalyticsQuery,
  ): Promise<GraphicObjectAnalyticsRepositoryResult> {
    const totalsPromise = this.buildTotalsQuery(query).getRawOne<TotalsRaw>();
    const imagesPromise = this.buildImagesDistributionQuery(
      query,
    ).getRawMany<ImageDistributionRaw>();
    const sizePromise = this.buildSizeDistributionQuery(
      query,
    ).getRawMany<SizeDistributionRaw>();
    const orientationPromise = this.buildOrientationDistributionQuery(
      query,
    ).getRawMany<OrientationDistributionRaw>();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, imagesRaw, sizeRaw, orientationRaw, trendRaw] =
      await Promise.all([
        totalsPromise,
        imagesPromise,
        sizePromise,
        orientationPromise,
        trendPromise,
      ]);

    return {
      totals: {
        totalObjects: this.toNumber(totalsRaw?.totalObjects),
        uniqueImages: this.toNumber(totalsRaw?.uniqueImages),
        averageWidth: this.toNumber(totalsRaw?.averageWidth),
        averageHeight: this.toNumber(totalsRaw?.averageHeight),
        averageArea: this.toNumber(totalsRaw?.averageArea),
        averagePositionX: this.toNumber(totalsRaw?.averagePositionX),
        averagePositionY: this.toNumber(totalsRaw?.averagePositionY),
      },
      objectsByImage: imagesRaw.map((row) => ({
        imageId: row.imageId,
        count: this.toNumber(row.count),
      })),
      sizeDistribution: sizeRaw.map((row) => ({
        bucket: row.bucket,
        count: this.toNumber(row.count),
      })),
      orientationDistribution: orientationRaw.map((row) => ({
        orientation: row.orientation,
        count: this.toNumber(row.count),
      })),
      objectsByDate: trendRaw.map<GraphicObjectAnalyticsTrendPoint>((row) => ({
        date: row.date,
        count: this.toNumber(row.count),
      })),
    };
  }

  private buildTotalsQuery(
    filters: GraphicObjectAnalyticsQuery,
  ): SelectQueryBuilder<GraphicObjectOrmEntity> {
    const qb = this.repository.createQueryBuilder('object');

    this.applyFilters(qb, filters);

    qb.select('COUNT(object.id)', 'totalObjects')
      .addSelect('COUNT(DISTINCT object.imageId)', 'uniqueImages')
      .addSelect('AVG(object.width)', 'averageWidth')
      .addSelect('AVG(object.height)', 'averageHeight')
      .addSelect('AVG(object.width * object.height)', 'averageArea')
      .addSelect('AVG(object.posX)', 'averagePositionX')
      .addSelect('AVG(object.posY)', 'averagePositionY');

    return qb;
  }

  private buildImagesDistributionQuery(
    filters: GraphicObjectAnalyticsQuery,
  ): SelectQueryBuilder<GraphicObjectOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('object')
      .select('object.imageId', 'imageId')
      .addSelect('COUNT(object.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('object.imageId').orderBy('count', 'DESC');

    return qb;
  }

  private buildSizeDistributionQuery(
    filters: GraphicObjectAnalyticsQuery,
  ): SelectQueryBuilder<GraphicObjectOrmEntity> {
    const qb = this.repository.createQueryBuilder('object');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN object.width * object.height < 10000 THEN 'SMALL'
        WHEN object.width * object.height < 40000 THEN 'MEDIUM'
        WHEN object.width * object.height < 90000 THEN 'LARGE'
        ELSE 'HUGE'
      END`,
      'bucket',
    )
      .addSelect('COUNT(object.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildOrientationDistributionQuery(
    filters: GraphicObjectAnalyticsQuery,
  ): SelectQueryBuilder<GraphicObjectOrmEntity> {
    const qb = this.repository.createQueryBuilder('object');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN object.width > object.height THEN 'LANDSCAPE'
        WHEN object.width < object.height THEN 'PORTRAIT'
        ELSE 'SQUARE'
      END`,
      'orientation',
    )
      .addSelect('COUNT(object.id)', 'count')
      .groupBy('orientation')
      .orderBy('orientation', 'ASC');

    return qb;
  }

  private buildTrendQuery(
    filters: GraphicObjectAnalyticsQuery,
  ): SelectQueryBuilder<GraphicObjectOrmEntity> {
    const qb = this.repository.createQueryBuilder('object');

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(object.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', object.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(object.id)', 'count')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<GraphicObjectOrmEntity>,
    filters: GraphicObjectAnalyticsQuery,
  ): void {
    if (filters.startDate) {
      qb.andWhere('object.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('object.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (typeof filters.imageId === 'number') {
      qb.andWhere('object.imageId = :imageId', { imageId: filters.imageId });
    }

    if (typeof filters.minWidth === 'number') {
      qb.andWhere('object.width >= :minWidth', { minWidth: filters.minWidth });
    }

    if (typeof filters.maxWidth === 'number') {
      qb.andWhere('object.width <= :maxWidth', { maxWidth: filters.maxWidth });
    }

    if (typeof filters.minHeight === 'number') {
      qb.andWhere('object.height >= :minHeight', {
        minHeight: filters.minHeight,
      });
    }

    if (typeof filters.maxHeight === 'number') {
      qb.andWhere('object.height <= :maxHeight', {
        maxHeight: filters.maxHeight,
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
