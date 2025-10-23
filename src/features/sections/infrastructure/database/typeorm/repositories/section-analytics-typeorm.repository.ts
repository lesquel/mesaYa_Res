import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import type { SectionAnalyticsQuery } from '../../../../application/dto/analytics/section-analytics.query';
import type {
  SectionAnalyticsRepositoryResult,
  SectionAnalyticsRepositoryTotals,
  SectionAnalyticsAreaBucket,
  SectionAnalyticsDistributionItem,
  SectionAnalyticsDimensionExtremes,
} from '../../../../application/dto/analytics/section-analytics.response';
import type { SectionAnalyticsRepositoryPort } from '../../../../application/ports/section-analytics.repository.port';
import { SectionOrmEntity } from '../../orm/index';

interface SectionTotalsRaw {
  totalSections: string | number | null;
  averageWidth: string | number | null;
  averageHeight: string | number | null;
  averageArea: string | number | null;
}

interface AreaBucketRaw {
  bucket: string;
  count: string | number | null;
}

interface DistributionRaw {
  restaurantId: string;
  count: string | number | null;
}

interface DimensionExtremesRaw {
  minWidth: string | number | null;
  maxWidth: string | number | null;
  minHeight: string | number | null;
  maxHeight: string | number | null;
}

@Injectable()
export class SectionAnalyticsTypeOrmRepository
  implements SectionAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly repository: Repository<SectionOrmEntity>,
  ) {}

  async compute(
    query: SectionAnalyticsQuery,
  ): Promise<SectionAnalyticsRepositoryResult> {
    const totalsPromise = this.buildTotalsQuery(query).getRawOne<SectionTotalsRaw>();
    const areaPromise = this.buildAreaDistributionQuery(query).getRawMany<AreaBucketRaw>();
    const restaurantPromise = this.buildRestaurantDistributionQuery(query).getRawMany<DistributionRaw>();
    const dimensionPromise = this.buildDimensionExtremesQuery(query).getRawOne<DimensionExtremesRaw>();

    const [totalsRaw, areaRaw, restaurantRaw, dimensionRaw] = await Promise.all([
      totalsPromise,
      areaPromise,
      restaurantPromise,
      dimensionPromise,
    ]);

    const totals: SectionAnalyticsRepositoryTotals = {
      totalSections: this.toNumber(totalsRaw?.totalSections),
      averageWidth: this.toNumber(totalsRaw?.averageWidth),
      averageHeight: this.toNumber(totalsRaw?.averageHeight),
      averageArea: this.toNumber(totalsRaw?.averageArea),
    };

    const dimensionExtremes: SectionAnalyticsDimensionExtremes = {
      minWidth: this.toNumber(dimensionRaw?.minWidth),
      maxWidth: this.toNumber(dimensionRaw?.maxWidth),
      minHeight: this.toNumber(dimensionRaw?.minHeight),
      maxHeight: this.toNumber(dimensionRaw?.maxHeight),
    };

    return {
      totals,
      areaDistribution: areaRaw.map((row) => ({
        bucket: row.bucket,
        count: this.toNumber(row.count),
      })),
      restaurantDistribution: restaurantRaw.map((row) => ({
        restaurantId: row.restaurantId,
        count: this.toNumber(row.count),
      })),
      dimensionExtremes,
    };
  }

  private buildTotalsQuery(
    filters: SectionAnalyticsQuery,
  ): SelectQueryBuilder<SectionOrmEntity> {
    const qb = this.repository.createQueryBuilder('section');

    this.applyFilters(qb, filters);

    qb.select('COUNT(section.id)', 'totalSections')
      .addSelect('AVG(section.width)', 'averageWidth')
      .addSelect('AVG(section.height)', 'averageHeight')
      .addSelect('AVG(section.width * section.height)', 'averageArea');

    return qb;
  }

  private buildAreaDistributionQuery(
    filters: SectionAnalyticsQuery,
  ): SelectQueryBuilder<SectionOrmEntity> {
    const qb = this.repository.createQueryBuilder('section');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN section.width * section.height < 200 THEN 'SMALL'
        WHEN section.width * section.height < 500 THEN 'MEDIUM'
        ELSE 'LARGE'
      END`,
      'bucket',
    )
      .addSelect('COUNT(section.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildRestaurantDistributionQuery(
    filters: SectionAnalyticsQuery,
  ): SelectQueryBuilder<SectionOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('section')
      .select('section.restaurantId', 'restaurantId')
      .addSelect('COUNT(section.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('section.restaurantId')
      .orderBy('COUNT(section.id)', 'DESC')
      .limit(10);

    return qb;
  }

  private buildDimensionExtremesQuery(
    filters: SectionAnalyticsQuery,
  ): SelectQueryBuilder<SectionOrmEntity> {
    const qb = this.repository.createQueryBuilder('section');

    this.applyFilters(qb, filters);

    qb.select('MIN(section.width)', 'minWidth')
      .addSelect('MAX(section.width)', 'maxWidth')
      .addSelect('MIN(section.height)', 'minHeight')
      .addSelect('MAX(section.height)', 'maxHeight');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<SectionOrmEntity>,
    filters: SectionAnalyticsQuery,
  ): void {
    if (filters.restaurantId) {
      qb.andWhere('section.restaurantId = :restaurantId', {
        restaurantId: filters.restaurantId,
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
