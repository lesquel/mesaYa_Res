import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import { toNumber } from '@shared/application/utils';
import type {
  SubscriptionAnalyticsQuery,
  SubscriptionAnalyticsRepositoryPort,
  SubscriptionAnalyticsRepositoryResult,
  SubscriptionAnalyticsRepositoryTotals,
} from '@features/subscription/application';
import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionStatesEnum,
} from '../../../domain/enums';
import { SubscriptionOrmEntity } from '../orm/subscription.type-orm.entity';

interface SubscriptionTotalsRaw {
  totalSubscriptions: string | number | null;
  activeSubscriptions: string | number | null;
  inactiveSubscriptions: string | number | null;
  totalRevenue: string | number | null;
  uniqueRestaurants: string | number | null;
}

interface StateDistributionRaw {
  state: string;
  count: string | number | null;
}

interface PlanPerformanceRaw {
  planId: string;
  planName: string;
  price: string | number | null;
  subscriptions: string | number | null;
  activeSubscriptions: string | number | null;
  revenue: string | number | null;
}

interface PeriodDistributionRaw {
  period: string;
  count: string | number | null;
  revenue: string | number | null;
}

interface TrendRaw {
  date: string;
  count: string | number | null;
  revenue: string | number | null;
}

@Injectable()
export class SubscriptionAnalyticsTypeOrmRepository
  implements SubscriptionAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly repository: Repository<SubscriptionOrmEntity>,
  ) {}

  async compute(
    query: SubscriptionAnalyticsQuery,
  ): Promise<SubscriptionAnalyticsRepositoryResult> {
    const totalsPromise =
      this.buildTotalsQuery(query).getRawOne<SubscriptionTotalsRaw>();
    const statePromise =
      this.buildStateDistributionQuery(
        query,
      ).getRawMany<StateDistributionRaw>();
    const planPromise =
      this.buildPlanPerformanceQuery(query).getRawMany<PlanPerformanceRaw>();
    const periodPromise =
      this.buildPeriodDistributionQuery(
        query,
      ).getRawMany<PeriodDistributionRaw>();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, stateRaw, planRaw, periodRaw, trendRaw] =
      await Promise.all([
        totalsPromise,
        statePromise,
        planPromise,
        periodPromise,
        trendPromise,
      ]);

    const totals: SubscriptionAnalyticsRepositoryTotals = {
      totalSubscriptions: toNumber(totalsRaw?.totalSubscriptions),
      activeSubscriptions: toNumber(totalsRaw?.activeSubscriptions),
      inactiveSubscriptions: toNumber(totalsRaw?.inactiveSubscriptions),
      totalRevenue: toNumber(totalsRaw?.totalRevenue),
      uniqueRestaurants: toNumber(totalsRaw?.uniqueRestaurants),
    };

    return {
      totals,
      stateDistribution: stateRaw.map((row) => ({
        state: row.state as SubscriptionStatesEnum,
        count: toNumber(row.count),
      })),
      planPerformance: planRaw.map((row) => ({
        planId: row.planId,
        planName: row.planName,
        price: toNumber(row.price),
        subscriptions: toNumber(row.subscriptions),
        activeSubscriptions: toNumber(row.activeSubscriptions),
        revenue: toNumber(row.revenue),
      })),
      periodDistribution: periodRaw.map((row) => ({
        period: row.period as SubscriptionPlanPeriodsEnum,
        count: toNumber(row.count),
        revenue: toNumber(row.revenue),
      })),
      activationTrend: trendRaw.map((row) => ({
        date: row.date,
        count: toNumber(row.count),
        revenue: toNumber(row.revenue),
      })),
    };
  }

  private buildTotalsQuery(
    filters: SubscriptionAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('subscription')
      .innerJoin('subscription.subscriptionPlan', 'plan');

    this.applyFilters(qb, filters);

    qb.select('COUNT(subscription.id)', 'totalSubscriptions')
      .addSelect(
        `SUM(CASE WHEN subscription.stateSubscription = :activeState THEN 1 ELSE 0 END)`,
        'activeSubscriptions',
      )
      .addSelect(
        `SUM(CASE WHEN subscription.stateSubscription = :inactiveState THEN 1 ELSE 0 END)`,
        'inactiveSubscriptions',
      )
      .addSelect('COALESCE(SUM(plan.price), 0)', 'totalRevenue')
      .addSelect(
        'COUNT(DISTINCT subscription.restaurantId)',
        'uniqueRestaurants',
      )
      .setParameter('activeState', SubscriptionStatesEnum.ACTIVE)
      .setParameter('inactiveState', SubscriptionStatesEnum.INACTIVE);

    return qb;
  }

  private buildStateDistributionQuery(
    filters: SubscriptionAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('subscription')
      .innerJoin('subscription.subscriptionPlan', 'plan');

    this.applyFilters(qb, filters);

    qb.select('subscription.stateSubscription', 'state')
      .addSelect('COUNT(subscription.id)', 'count')
      .groupBy('subscription.stateSubscription')
      .orderBy('count', 'DESC');

    return qb;
  }

  private buildPlanPerformanceQuery(
    filters: SubscriptionAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('subscription')
      .innerJoin('subscription.subscriptionPlan', 'plan');

    this.applyFilters(qb, filters);

    qb.select('plan.id', 'planId')
      .addSelect('plan.name', 'planName')
      .addSelect('plan.price', 'price')
      .addSelect('COUNT(subscription.id)', 'subscriptions')
      .addSelect(
        `SUM(CASE WHEN subscription.stateSubscription = :activeState THEN 1 ELSE 0 END)`,
        'activeSubscriptions',
      )
      .addSelect('COALESCE(SUM(plan.price), 0)', 'revenue')
      .groupBy('plan.id')
      .addGroupBy('plan.name')
      .addGroupBy('plan.price')
      .orderBy('subscriptions', 'DESC')
      .limit(5)
      .setParameter('activeState', SubscriptionStatesEnum.ACTIVE);

    return qb;
  }

  private buildPeriodDistributionQuery(
    filters: SubscriptionAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('subscription')
      .innerJoin('subscription.subscriptionPlan', 'plan');

    this.applyFilters(qb, filters);

    qb.select('plan.subscriptionPeriod', 'period')
      .addSelect('COUNT(subscription.id)', 'count')
      .addSelect('COALESCE(SUM(plan.price), 0)', 'revenue')
      .groupBy('plan.subscriptionPeriod')
      .orderBy('count', 'DESC');

    return qb;
  }

  private buildTrendQuery(
    filters: SubscriptionAnalyticsQuery,
  ): SelectQueryBuilder<SubscriptionOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('subscription')
      .innerJoin('subscription.subscriptionPlan', 'plan');

    this.applyFilters(qb, filters);

    const dialect = this.repository.manager.connection.options.type;
    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(subscription.subscriptionStartDate, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', subscription.subscriptionStartDate)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(subscription.id)', 'count')
      .addSelect('COALESCE(SUM(plan.price), 0)', 'revenue')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<SubscriptionOrmEntity>,
    filters: SubscriptionAnalyticsQuery,
  ): void {
    if (filters.subscriptionPlanId) {
      qb.andWhere('subscription.subscriptionPlanId = :subscriptionPlanId', {
        subscriptionPlanId: filters.subscriptionPlanId,
      });
    }

    if (filters.restaurantId) {
      qb.andWhere('subscription.restaurantId = :restaurantId', {
        restaurantId: filters.restaurantId,
      });
    }

    if (filters.state) {
      qb.andWhere('subscription.stateSubscription = :state', {
        state: filters.state,
      });
    }

    if (filters.subscriptionPeriod) {
      qb.andWhere('plan.subscriptionPeriod = :subscriptionPeriod', {
        subscriptionPeriod: filters.subscriptionPeriod,
      });
    }

    if (filters.startDate) {
      qb.andWhere('subscription.subscriptionStartDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('subscription.subscriptionStartDate <= :endDate', {
        endDate: filters.endDate,
      });
    }
  }
}
