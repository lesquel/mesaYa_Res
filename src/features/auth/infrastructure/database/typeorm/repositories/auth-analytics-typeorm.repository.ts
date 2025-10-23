import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import type { AuthAnalyticsQuery } from '../../../../application/dto/queries/auth-analytics.query';
import type {
  AuthAnalyticsRepositoryResult,
  AuthAnalyticsTrendPoint,
} from '../../../../application/dto/responses/auth-analytics.response';
import type { AuthAnalyticsRepositoryPort } from '../../../../application/ports/auth-analytics.repository.port';
import { UserOrmEntity } from '../entities/user.orm-entity';

type TotalsRaw = {
  totalUsers: string | number | null;
  activeUsers: string | number | null;
  inactiveUsers: string | number | null;
};

type DistributionRaw = {
  role?: string | null;
  permission?: string | null;
  count: string | number | null;
};

type TrendRaw = {
  date: string;
  count: string | number | null;
};

@Injectable()
export class AuthAnalyticsTypeOrmRepository
  implements AuthAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
  ) {}

  async compute(
    query: AuthAnalyticsQuery,
  ): Promise<AuthAnalyticsRepositoryResult> {
    const totalsPromise = this.buildTotalsQuery(query).getRawOne<TotalsRaw>();
    const rolesPromise =
      this.buildRolesDistributionQuery(query).getRawMany<DistributionRaw>();
    const permissionsPromise =
      this.buildPermissionsDistributionQuery(
        query,
      ).getRawMany<DistributionRaw>();
    const trendPromise =
      this.buildRegistrationTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, rolesRaw, permissionsRaw, trendRaw] = await Promise.all([
      totalsPromise,
      rolesPromise,
      permissionsPromise,
      trendPromise,
    ]);

    return {
      totals: {
        totalUsers: this.toNumber(totalsRaw?.totalUsers),
        activeUsers: this.toNumber(totalsRaw?.activeUsers),
        inactiveUsers: this.toNumber(totalsRaw?.inactiveUsers),
      },
      roleDistribution: rolesRaw.map((row) => ({
        role: row.role ?? 'unknown',
        count: this.toNumber(row.count),
      })),
      permissionDistribution: permissionsRaw.map((row) => ({
        permission: row.permission ?? 'unknown',
        count: this.toNumber(row.count),
      })),
      registrationsByDate: trendRaw.map<AuthAnalyticsTrendPoint>((row) => ({
        date: row.date,
        count: this.toNumber(row.count),
      })),
    };
  }

  private buildTotalsQuery(
    filters: AuthAnalyticsQuery,
  ): SelectQueryBuilder<UserOrmEntity> {
    const qb = this.users.createQueryBuilder('user');

    if (filters.role) {
      qb.innerJoin('user.roles', 'roleFilter', 'roleFilter.name = :roleName', {
        roleName: filters.role,
      });
    }

    this.applyActiveFilter(qb, filters);
    this.applyDateFilters(qb, filters);

    qb.select('COUNT(DISTINCT user.id)', 'totalUsers')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN user.active = :trueValue THEN user.id END)',
        'activeUsers',
      )
      .addSelect(
        'COUNT(DISTINCT CASE WHEN user.active = :falseValue THEN user.id END)',
        'inactiveUsers',
      )
      .setParameter('trueValue', true)
      .setParameter('falseValue', false);

    return qb;
  }

  private buildRolesDistributionQuery(
    filters: AuthAnalyticsQuery,
  ): SelectQueryBuilder<UserOrmEntity> {
    const qb = this.users
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .select('role.name', 'role')
      .addSelect('COUNT(DISTINCT user.id)', 'count');

    if (filters.role) {
      qb.andWhere('role.name = :roleName', { roleName: filters.role });
    }

    this.applyActiveFilter(qb, filters);
    this.applyDateFilters(qb, filters);

    qb.groupBy('role.name').orderBy('count', 'DESC');

    return qb;
  }

  private buildPermissionsDistributionQuery(
    filters: AuthAnalyticsQuery,
  ): SelectQueryBuilder<UserOrmEntity> {
    const qb = this.users
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .innerJoin('role.permissions', 'permission')
      .select('permission.name', 'permission')
      .addSelect('COUNT(DISTINCT user.id)', 'count');

    if (filters.role) {
      qb.andWhere('role.name = :roleName', { roleName: filters.role });
    }

    this.applyActiveFilter(qb, filters);
    this.applyDateFilters(qb, filters);

    qb.groupBy('permission.name').orderBy('count', 'DESC');

    return qb;
  }

  private buildRegistrationTrendQuery(
    filters: AuthAnalyticsQuery,
  ): SelectQueryBuilder<UserOrmEntity> {
    const qb = this.users.createQueryBuilder('user');

    if (filters.role) {
      qb.innerJoin('user.roles', 'roleTrend', 'roleTrend.name = :roleName', {
        roleName: filters.role,
      });
    }

    this.applyActiveFilter(qb, filters);
    this.applyDateFilters(qb, filters);

    const dateExpression = 'CAST(user.createdAt AS DATE)';

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(DISTINCT user.id)', 'count')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyActiveFilter(
    qb: SelectQueryBuilder<UserOrmEntity>,
    filters: AuthAnalyticsQuery,
  ): void {
    if (typeof filters.active === 'boolean') {
      qb.andWhere('user.active = :activeFilter', {
        activeFilter: filters.active,
      });
    }
  }

  private applyDateFilters(
    qb: SelectQueryBuilder<UserOrmEntity>,
    filters: AuthAnalyticsQuery,
  ): void {
    if (filters.startDate) {
      qb.andWhere('user.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('user.createdAt <= :endDate', { endDate: filters.endDate });
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
