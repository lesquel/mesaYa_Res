import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import type {
  SubscriptionPlanAnalyticsQuery,
  SubscriptionPlanAnalyticsRepositoryPort,
  SubscriptionPlanAnalyticsRepositoryResult,
  SubscriptionPlanAnalyticsRepositoryTotals,
} from '@features/subscription/application';
import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
  SubscriptionStatesEnum,
} from '../../../domain/enums';
import { SubscriptionPlanOrmEntity } from '../orm/subscription-plan.type-orm.entity';

interface PlanTotalsRaw {
  totalPlans: string | number | null;
  activePlans: string | number | null;
  inactivePlans: string | number | null;
  averagePrice: string | number | null;
  minPrice: string | number | null;
  maxPrice: string | number | null;
}

interface PriceBucketRaw {
  bucket: string;
  count: string | number | null;
}

interface PeriodDistributionRaw {
  period: string;
  count: string | number | null;
}

interface StateDistributionRaw {
  state: string;
  count: string | number | null;
}

interface UsageRaw {
  planId: string;
  planName: string;
  price: string | number | null;
  subscriptions: string | number | null;
  activeSubscriptions: string | number | null;
  revenue: string | number | null;
}

interface TrendRaw {
  date: string;
  count: string | number | null;
  averagePrice: string | number | null;
}

@Injectable()
export class SubscriptionPlanAnalyticsTypeOrmRepository
  implements SubscriptionPlanAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(SubscriptionPlanOrmEntity)
    private readonly repository: Repository<SubscriptionPlanOrmEntity>,
  ) {}

  async compute(
    query: SubscriptionPlanAnalyticsQuery,
  ): Promise<SubscriptionPlanAnalyticsRepositoryResult> {
    const totalsPromise =
      this.buildSummaryQuery(query).getRawOne<PlanTotalsRaw>();
    const pricePromise =
      this.buildPriceDistributionQuery(query).getRawMany<PriceBucketRaw>();
    const periodPromise =
      this.buildPeriodDistributionQuery(query).getRawMany<PeriodDistributionRaw>();
    const statePromise =
      this.buildStateDistributionQuery(query).getRawMany<StateDistributionRaw>();
    const usagePromise =
      this.buildUsageQuery(query).getRawMany<UsageRaw>();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, priceRaw, periodRaw, stateRaw, usageRaw, trendRaw] =
      await Promise.all([
        totalsPromise,
        pricePromise,
        periodPromise,
        statePromise,
        usagePromise,
        trendPromise,
      ]);

    const totals: SubscriptionPlanAnalyticsRepositoryTotals = {
      totalPlans: this.toNumber(totalsRaw?.totalPlans),
      activePlans: this.toNumber(totalsRaw?.activePlans),
      inactivePlans: this.toNumber(totalsRaw?.inactivePlans),
      averagePrice: this.toNumber(totalsRaw?.averagePrice),
      minPrice: this.toNumber(totalsRaw?.minPrice),
      maxPrice: this.toNumber(totalsRaw?.maxPrice),
    };

    return {
      totals,
      priceDistribution: priceRaw.map((row) => ({
        bucket: row.bucket,
        count: this.toNumber(row.count),
      })),
      periodDistribution: periodRaw.map((row) => ({
        period: row.period as SubscriptionPlanPeriodsEnum,
        count: this.toNumber(row.count),
      })),
      stateDistribution: stateRaw.map((row) => ({
        state: row.state as SubscriptionPlanStatesEnum,
        count: this.toNumber(row.count),
      })),
      subscriptionUsage: usageRaw.map((row) => ({
        planId: row.planId,
        planName: row.planName,
        price: this.toNumber(row.price),
        subscriptions: this.toNumber(row.subscriptions),
        activeSubscriptions: this.toNumber(row.activeSubscriptions),
        revenue: this.toNumber(row.revenue),
      })),
      creationTrend: trendRaw.map((row) => ({
        date: row.date,
        count: this.toNumber(row.count),
        averagePrice: this.toNumber(row.averagePrice),
      })),
    };
  }

  private buildSummaryQuery(
    filters: SubscriptionPlanAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionPlanOrmEntity> {
    const qb = this.repository.createQueryBuilder('plan');

    this.applyFilters(qb, filters);

    qb.select('COUNT(plan.id)', 'totalPlans')
      .addSelect(
        `SUM(CASE WHEN plan.stateSubscriptionPlan = :activeState THEN 1 ELSE 0 END)`,
        'activePlans',
      )
      .addSelect(
        `SUM(CASE WHEN plan.stateSubscriptionPlan = :inactiveState THEN 1 ELSE 0 END)`,
        'inactivePlans',
      )
      .addSelect('COALESCE(AVG(plan.price), 0)', 'averagePrice')
      .addSelect('COALESCE(MIN(plan.price), 0)', 'minPrice')
      .addSelect('COALESCE(MAX(plan.price), 0)', 'maxPrice')
      .setParameter('activeState', SubscriptionPlanStatesEnum.ACTIVE)
      .setParameter('inactiveState', SubscriptionPlanStatesEnum.INACTIVE);

    return qb;
  }

  private buildPriceDistributionQuery(
    filters: SubscriptionPlanAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionPlanOrmEntity> {
    const qb = this.repository.createQueryBuilder('plan');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN plan.price < 20 THEN 'BASIC'
        WHEN plan.price < 50 THEN 'STANDARD'
        WHEN plan.price < 100 THEN 'PREMIUM'
        ELSE 'ENTERPRISE'
      END`,
      'bucket',
    )
      .addSelect('COUNT(plan.id)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    return qb;
  }

  private buildPeriodDistributionQuery(
    filters: SubscriptionPlanAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionPlanOrmEntity> {
    const qb = this.repository.createQueryBuilder('plan');

    this.applyFilters(qb, filters);

    qb.select('plan.subscriptionPeriod', 'period')
      .addSelect('COUNT(plan.id)', 'count')
      .groupBy('plan.subscriptionPeriod')
      .orderBy('count', 'DESC');

    return qb;
  }

  private buildStateDistributionQuery(
    filters: SubscriptionPlanAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionPlanOrmEntity> {
    const qb = this.repository.createQueryBuilder('plan');

    this.applyFilters(qb, filters);

    qb.select('plan.stateSubscriptionPlan', 'state')
      .addSelect('COUNT(plan.id)', 'count')
      .groupBy('plan.stateSubscriptionPlan')
      .orderBy('count', 'DESC');

    return qb;
  }

  private buildUsageQuery(
    filters: SubscriptionPlanAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionPlanOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('plan')
      .leftJoin('plan.subscriptions', 'subscription');

    this.applyFilters(qb, filters);

    qb.select('plan.id', 'planId')
      .addSelect('plan.name', 'planName')
      .addSelect('plan.price', 'price')
      .addSelect('COUNT(subscription.id)', 'subscriptions')
      .addSelect(
        `COALESCE(SUM(CASE WHEN subscription.stateSubscription = :activeState THEN 1 ELSE 0 END), 0)`,
        'activeSubscriptions',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN subscription.id IS NOT NULL THEN plan.price ELSE 0 END), 0)`,
        'revenue',
      )
      .groupBy('plan.id')
      .addGroupBy('plan.name')
      .addGroupBy('plan.price')
      .orderBy('subscriptions', 'DESC')
      .limit(5)
      .setParameter('activeState', SubscriptionStatesEnum.ACTIVE);

    return qb;
  }

  private buildTrendQuery(
    filters: SubscriptionPlanAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionPlanOrmEntity> {
    const qb = this.repository.createQueryBuilder('plan');

    this.applyFilters(qb, filters);

    const dialect = this.repository.manager.connection.options.type;
    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(plan.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', plan.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(plan.id)', 'count')
      .addSelect('COALESCE(AVG(plan.price), 0)', 'averagePrice')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<SubscriptionPlanOrmEntity>,
    filters: SubscriptionPlanAnalyticsQuery,
  ): void {
    if (filters.state) {
      qb.andWhere('plan.stateSubscriptionPlan = :state', {
        state: filters.state,
      });
    }

    if (filters.period) {
      qb.andWhere('plan.subscriptionPeriod = :period', {
        period: filters.period,
      });
    }

    if (filters.startDate) {
      qb.andWhere('plan.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('plan.createdAt <= :endDate', {
        endDate: filters.endDate,
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
