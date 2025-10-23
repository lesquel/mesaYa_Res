import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import type { PaymentAnalyticsQuery } from '@features/payment/application/dtos/analytics/payment-analytics.query';
import type {
  PaymentAnalyticsRepositoryResult,
  PaymentAnalyticsTrendPoint,
} from '@features/payment/application/dtos/analytics/payment-analytics.response';
import type { PaymentAnalyticsRepositoryPort } from '@features/payment/application/ports/payment-analytics.repository.port';
import { PaymentOrmEntity } from '../orm/payment.type-orm.entity';
import {
  PaymentStatusEnum,
  PaymentTypeEnum,
} from '@features/payment/domain/enums';

interface TotalsRaw {
  totalPayments: string | number | null;
  totalAmount: string | number | null;
  averageAmount: string | number | null;
  completedPayments: string | number | null;
  pendingPayments: string | number | null;
  cancelledPayments: string | number | null;
  minAmount: string | number | null;
  maxAmount: string | number | null;
}

interface StatusDistributionRaw {
  status: PaymentStatusEnum;
  count: string | number | null;
}

interface TypeDistributionRaw {
  type: PaymentTypeEnum;
  count: string | number | null;
  amount: string | number | null;
}

interface RestaurantDistributionRaw {
  restaurantId: string;
  count: string | number | null;
  amount: string | number | null;
}

interface RevenueTrendRaw {
  date: string;
  count: string | number | null;
  amount: string | number | null;
}

@Injectable()
export class PaymentAnalyticsTypeOrmRepository
  implements PaymentAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repository: Repository<PaymentOrmEntity>,
  ) {}

  async compute(
    query: PaymentAnalyticsQuery,
  ): Promise<PaymentAnalyticsRepositoryResult> {
    const totalsPromise = this.buildTotalsQuery(query).getRawOne<TotalsRaw>();
    const statusPromise =
      this.buildStatusDistributionQuery(
        query,
      ).getRawMany<StatusDistributionRaw>();
    const typesPromise =
      this.buildTypeDistributionQuery(query).getRawMany<TypeDistributionRaw>();
    const restaurantsPromise =
      this.buildRestaurantDistributionQuery(
        query,
      ).getRawMany<RestaurantDistributionRaw>();
    const revenueTrendPromise =
      this.buildRevenueTrendQuery(query).getRawMany<RevenueTrendRaw>();

    const [totalsRaw, statusRaw, typesRaw, restaurantsRaw, revenueRaw] =
      await Promise.all([
        totalsPromise,
        statusPromise,
        typesPromise,
        restaurantsPromise,
        revenueTrendPromise,
      ]);

    return {
      totals: {
        totalPayments: this.toNumber(totalsRaw?.totalPayments),
        totalAmount: this.toNumber(totalsRaw?.totalAmount),
        averageAmount: this.toNumber(totalsRaw?.averageAmount),
        completedPayments: this.toNumber(totalsRaw?.completedPayments),
        pendingPayments: this.toNumber(totalsRaw?.pendingPayments),
        cancelledPayments: this.toNumber(totalsRaw?.cancelledPayments),
        minAmount: this.toNumber(totalsRaw?.minAmount),
        maxAmount: this.toNumber(totalsRaw?.maxAmount),
      },
      statusDistribution: statusRaw.map((row) => ({
        status: row.status,
        count: this.toNumber(row.count),
      })),
      typeDistribution: typesRaw.map((row) => ({
        type: row.type,
        count: this.toNumber(row.count),
        amount: this.toNumber(row.amount),
      })),
      restaurantDistribution: restaurantsRaw.map((row) => ({
        restaurantId: row.restaurantId,
        count: this.toNumber(row.count),
        amount: this.toNumber(row.amount),
      })),
      revenueByDate: revenueRaw.map<PaymentAnalyticsTrendPoint>((row) => ({
        date: row.date,
        count: this.toNumber(row.count),
        amount: this.toNumber(row.amount),
      })),
    };
  }

  private buildTotalsQuery(
    filters: PaymentAnalyticsQuery,
  ): SelectQueryBuilder<PaymentOrmEntity> {
    const qb = this.createBaseQuery();

    this.applyFilters(qb, filters);

    qb.select('COUNT(payment.id)', 'totalPayments')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'totalAmount')
      .addSelect('COALESCE(AVG(payment.amount), 0)', 'averageAmount')
      .addSelect(
        "SUM(CASE WHEN payment.paymentStatus = 'COMPLETED' THEN 1 ELSE 0 END)",
        'completedPayments',
      )
      .addSelect(
        "SUM(CASE WHEN payment.paymentStatus = 'PENDING' THEN 1 ELSE 0 END)",
        'pendingPayments',
      )
      .addSelect(
        "SUM(CASE WHEN payment.paymentStatus = 'CANCELLED' THEN 1 ELSE 0 END)",
        'cancelledPayments',
      )
      .addSelect('COALESCE(MIN(payment.amount), 0)', 'minAmount')
      .addSelect('COALESCE(MAX(payment.amount), 0)', 'maxAmount');

    return qb;
  }

  private buildStatusDistributionQuery(
    filters: PaymentAnalyticsQuery,
  ): SelectQueryBuilder<PaymentOrmEntity> {
    const qb = this.createBaseQuery()
      .select('payment.paymentStatus', 'status')
      .addSelect('COUNT(payment.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('payment.paymentStatus').orderBy('count', 'DESC');

    return qb;
  }

  private buildTypeDistributionQuery(
    filters: PaymentAnalyticsQuery,
  ): SelectQueryBuilder<PaymentOrmEntity> {
    const qb = this.createBaseQuery()
      .select(
        `CASE
          WHEN payment.reservationId IS NOT NULL THEN '${PaymentTypeEnum.RESERVATION}'
          ELSE '${PaymentTypeEnum.SUBSCRIPTION}'
        END`,
        'type',
      )
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount');

    this.applyFilters(qb, filters);

    qb.groupBy('type').orderBy('amount', 'DESC');

    return qb;
  }

  private buildRestaurantDistributionQuery(
    filters: PaymentAnalyticsQuery,
  ): SelectQueryBuilder<PaymentOrmEntity> {
    const qb = this.createBaseQuery()
      .select('reservation.restaurantId', 'restaurantId')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount')
      .where('reservation.restaurantId IS NOT NULL');

    this.applyFilters(qb, filters);

    qb.groupBy('reservation.restaurantId').orderBy('amount', 'DESC');

    return qb;
  }

  private buildRevenueTrendQuery(
    filters: PaymentAnalyticsQuery,
  ): SelectQueryBuilder<PaymentOrmEntity> {
    const qb = this.createBaseQuery();

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(payment.createdAt, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', payment.createdAt)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private createBaseQuery(): SelectQueryBuilder<PaymentOrmEntity> {
    return this.repository
      .createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'reservation');
  }

  private applyFilters(
    qb: SelectQueryBuilder<PaymentOrmEntity>,
    filters: PaymentAnalyticsQuery,
  ): void {
    if (filters.startDate) {
      qb.andWhere('payment.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('payment.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.status) {
      qb.andWhere('payment.paymentStatus = :status', {
        status: filters.status,
      });
    }

    if (filters.type === PaymentTypeEnum.RESERVATION) {
      qb.andWhere('payment.reservationId IS NOT NULL');
    } else if (filters.type === PaymentTypeEnum.SUBSCRIPTION) {
      qb.andWhere('payment.subscriptionId IS NOT NULL');
    }

    if (filters.restaurantId) {
      qb.andWhere('reservation.restaurantId = :restaurantId', {
        restaurantId: filters.restaurantId,
      });
    }

    if (typeof filters.minAmount === 'number') {
      qb.andWhere('payment.amount >= :minAmount', {
        minAmount: filters.minAmount,
      });
    }

    if (typeof filters.maxAmount === 'number') {
      qb.andWhere('payment.amount <= :maxAmount', {
        maxAmount: filters.maxAmount,
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
