import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, type SelectQueryBuilder } from 'typeorm';
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
      totalTables: this.toNumber(totalsRaw?.totalTables),
      averageCapacity: this.toNumber(totalsRaw?.averageCapacity),
      minCapacity: this.toNumber(totalsRaw?.minCapacity),
      maxCapacity: this.toNumber(totalsRaw?.maxCapacity),
    };

    return {
      totals,
      capacityDistribution: capacityRaw.map((row) => ({
        bucket: row.bucket,
        count: this.toNumber(row.count),
      })),
      sectionDistribution: sectionRaw.map((row) => ({
        id: row.id,
        count: this.toNumber(row.count),
      })),
      restaurantDistribution: restaurantRaw.map((row) => ({
        id: row.id,
        count: this.toNumber(row.count),
      })),
    };
  }

  private buildTotalsQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository.createQueryBuilder('table');

    this.applyFilters(qb, filters);

    qb.select('COUNT(table.id)', 'totalTables')
      .addSelect('AVG(table.capacity)', 'averageCapacity')
      .addSelect('MIN(table.capacity)', 'minCapacity')
      .addSelect('MAX(table.capacity)', 'maxCapacity');

    return qb;
  }

  private buildCapacityDistributionQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository.createQueryBuilder('table');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN table.capacity <= 2 THEN 'SMALL'
        WHEN table.capacity <= 4 THEN 'MEDIUM'
        ELSE 'LARGE'
      END`,
      'bucket',
    )
      .addSelect('COUNT(table.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildSectionDistributionQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('table')
      .select('table.sectionId', 'id')
      .addSelect('COUNT(table.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('table.sectionId').orderBy('COUNT(table.id)', 'DESC').limit(10);

    return qb;
  }

  private buildRestaurantDistributionQuery(
    filters: TableAnalyticsQuery,
  ): SelectQueryBuilder<TableOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('table')
      .leftJoin('table.section', 'section')
      .select('section.restaurantId', 'id')
      .addSelect('COUNT(table.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('section.restaurantId')
      .orderBy('COUNT(table.id)', 'DESC')
      .limit(10);

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<TableOrmEntity>,
    filters: TableAnalyticsQuery,
  ): void {
    if (filters.sectionId) {
      qb.andWhere('table.sectionId = :sectionId', {
        sectionId: filters.sectionId,
      });
    }

    if (filters.restaurantId) {
      qb.leftJoin('table.section', 'sectionFilter').andWhere(
        'sectionFilter.restaurantId = :restaurantId',
        { restaurantId: filters.restaurantId },
      );
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
