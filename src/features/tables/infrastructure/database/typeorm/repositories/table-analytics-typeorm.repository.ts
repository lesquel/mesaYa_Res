import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import { toNumber } from '@shared/application/utils';
import type { TableAnalyticsQuery } from '../../../../application/dto/analytics/table-analytics.query';
import type {
  TableAnalyticsRepositoryResult,
  TableAnalyticsRepositoryTotals,
} from '../../../../application/dto/analytics/table-analytics.response';
import type { TableAnalyticsRepositoryPort } from '../../../../application/ports/table-analytics.repository.port';
import { TableOrmEntity } from '../orm';

interface TableTotalsRaw {
  totalTables: string | number | null;
  averageCapacity: string | number | null;
  minCapacity: string | number | null;
  maxCapacity: string | number | null;
}

interface CapacityBucketRaw {
  bucket: string;
  count: string | number | null;
}

interface DistributionRaw {
  id: string;
  count: string | number | null;
}

@Injectable()
export class TableAnalyticsTypeOrmRepository
  implements TableAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(TableOrmEntity)
    private readonly repository: Repository<TableOrmEntity>,
  ) {}

  async compute(
    query: TableAnalyticsQuery,
  ): Promise<TableAnalyticsRepositoryResult> {
    const totalsPromise =
      this.buildTotalsQuery(query).getRawOne<TableTotalsRaw>();
    const capacityPromise =
      this.buildCapacityDistributionQuery(
        query,
      ).getRawMany<CapacityBucketRaw>();
    const sectionPromise =
      this.buildSectionDistributionQuery(query).getRawMany<DistributionRaw>();
    const restaurantPromise =
      this.buildRestaurantDistributionQuery(
        query,
      ).getRawMany<DistributionRaw>();

    const [totalsRaw, capacityRaw, sectionRaw, restaurantRaw] =
      await Promise.all([
        totalsPromise,
        capacityPromise,
        sectionPromise,
        restaurantPromise,
      ]);

    const totals: TableAnalyticsRepositoryTotals = {
      totalTables: toNumber(totalsRaw?.totalTables),
      averageCapacity: toNumber(totalsRaw?.averageCapacity),
      minCapacity: toNumber(totalsRaw?.minCapacity),
      maxCapacity: toNumber(totalsRaw?.maxCapacity),
    };

    return {
      totals,
      capacityDistribution: capacityRaw.map((row) => ({
        bucket: row.bucket,
        count: toNumber(row.count),
      })),
      sectionDistribution: sectionRaw.map((row) => ({
        id: row.id,
        count: toNumber(row.count),
      })),
      restaurantDistribution: restaurantRaw.map((row) => ({
        id: row.id,
        count: toNumber(row.count),
      })),
    };
  }

  private buildTotalsQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository.createQueryBuilder('t');

    this.applyFilters(qb, filters);

    qb.select('COUNT(t.id)', 'totalTables')
      .addSelect('AVG(t.capacity)', 'averageCapacity')
      .addSelect('MIN(t.capacity)', 'minCapacity')
      .addSelect('MAX(t.capacity)', 'maxCapacity');

    return qb;
  }

  private buildCapacityDistributionQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository.createQueryBuilder('t');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN t.capacity <= 2 THEN 'SMALL'
        WHEN t.capacity <= 4 THEN 'MEDIUM'
        ELSE 'LARGE'
      END`,
      'bucket',
    )
      .addSelect('COUNT(t.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildSectionDistributionQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('t')
      .leftJoin('t.section', 'sectionDistribution')
      .select('sectionDistribution.id', 'id')
      .addSelect('COUNT(t.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('sectionDistribution.id')
      .orderBy('COUNT(t.id)', 'DESC')
      .limit(10);

    return qb;
  }

  private buildRestaurantDistributionQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('t')
      .leftJoin('t.section', 'section')
      .select('section.restaurantId', 'id')
      .addSelect('COUNT(t.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('section.restaurantId').orderBy('COUNT(t.id)', 'DESC').limit(10);

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<TableOrmEntity>,
    filters: TableAnalyticsQuery,
  ): void {
    if (filters.sectionId) {
      const alias = this.ensureSectionJoin(qb);
      qb.andWhere(`${alias}.id = :sectionId`, {
        sectionId: filters.sectionId,
      });
    }

    if (filters.restaurantId) {
      const alias = this.ensureSectionJoin(qb);
      qb.andWhere(`${alias}.restaurantId = :restaurantId`, {
        restaurantId: filters.restaurantId,
      });
    }
  }

  private ensureSectionJoin(qb: SelectQueryBuilder<TableOrmEntity>): string {
    const alias = 'sectionFilter';
    const hasJoin = qb.expressionMap.joinAttributes.some(
      (join) => join.alias?.name === alias,
    );

    if (!hasJoin) {
      qb.leftJoin('t.section', alias);
    }

    return alias;
  }
}
