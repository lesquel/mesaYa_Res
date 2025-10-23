import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import type { ReservationAnalyticsQuery } from '../../application/dto/analytics/reservation-analytics.query';
import type {
  ReservationAnalyticsRepositoryResult,
  ReservationAnalyticsTrendPoint,
} from '../../application/dto/analytics/reservation-analytics.response';
import type { ReservationAnalyticsRepositoryPort } from '../../application/ports/reservation-analytics.repository.port';
import { ReservationOrmEntity } from '../orm/index';

interface TotalsRaw {
  totalReservations: string | number | null;
  confirmedReservations: string | number | null;
  cancelledReservations: string | number | null;
  pendingReservations: string | number | null;
  upcomingReservations: string | number | null;
  averageGuestsPerReservation: string | number | null;
}

interface StatusDistributionRaw {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  count: string | number | null;
}

interface GuestDistributionRaw {
  segment: string;
  count: string | number | null;
}

interface RestaurantDistributionRaw {
  restaurantId: string;
  count: string | number | null;
}

interface HourDistributionRaw {
  hour: string | number;
  count: string | number | null;
}

interface TrendRaw {
  date: string;
  count: string | number | null;
  guests: string | number | null;
}

@Injectable()
export class ReservationAnalyticsTypeOrmRepository
  implements ReservationAnalyticsRepositoryPort
{
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly repository: Repository<ReservationOrmEntity>,
  ) {}

  async compute(
    query: ReservationAnalyticsQuery,
  ): Promise<ReservationAnalyticsRepositoryResult> {
    const totalsPromise = this.buildTotalsQuery(query).getRawOne<TotalsRaw>();
    const statusPromise =
      this.buildStatusDistributionQuery(
        query,
      ).getRawMany<StatusDistributionRaw>();
    const guestPromise =
      this.buildGuestDistributionQuery(
        query,
      ).getRawMany<GuestDistributionRaw>();
    const restaurantPromise =
      this.buildRestaurantDistributionQuery(
        query,
      ).getRawMany<RestaurantDistributionRaw>();
    const hourPromise =
      this.buildHourDistributionQuery(query).getRawMany<HourDistributionRaw>();
    const trendPromise = this.buildTrendQuery(query).getRawMany<TrendRaw>();

    const [totalsRaw, statusRaw, guestRaw, restaurantRaw, hourRaw, trendRaw] =
      await Promise.all([
        totalsPromise,
        statusPromise,
        guestPromise,
        restaurantPromise,
        hourPromise,
        trendPromise,
      ]);

    return {
      totals: {
        totalReservations: this.toNumber(totalsRaw?.totalReservations),
        confirmedReservations: this.toNumber(totalsRaw?.confirmedReservations),
        cancelledReservations: this.toNumber(totalsRaw?.cancelledReservations),
        pendingReservations: this.toNumber(totalsRaw?.pendingReservations),
        upcomingReservations: this.toNumber(totalsRaw?.upcomingReservations),
        averageGuestsPerReservation: this.toNumber(
          totalsRaw?.averageGuestsPerReservation,
        ),
      },
      statusDistribution: statusRaw.map((row) => ({
        status: row.status,
        count: this.toNumber(row.count),
      })),
      guestDistribution: guestRaw.map((row) => ({
        segment: row.segment,
        count: this.toNumber(row.count),
      })),
      restaurantDistribution: restaurantRaw.map((row) => ({
        restaurantId: row.restaurantId,
        count: this.toNumber(row.count),
      })),
      hourDistribution: hourRaw.map((row) => ({
        hour: this.toNumber(row.hour),
        count: this.toNumber(row.count),
      })),
      reservationsByDate: trendRaw.map<ReservationAnalyticsTrendPoint>(
        (row) => ({
          date: row.date,
          count: this.toNumber(row.count),
          guests: this.toNumber(row.guests),
        }),
      ),
    };
  }

  private buildTotalsQuery(
    filters: ReservationAnalyticsQuery,
  ): SelectQueryBuilder<ReservationOrmEntity> {
    const qb = this.repository.createQueryBuilder('reservation');

    this.applyFilters(qb, filters);

    qb.select('COUNT(reservation.id)', 'totalReservations')
      .addSelect(
        "SUM(CASE WHEN reservation.status = 'CONFIRMED' THEN 1 ELSE 0 END)",
        'confirmedReservations',
      )
      .addSelect(
        "SUM(CASE WHEN reservation.status = 'CANCELLED' THEN 1 ELSE 0 END)",
        'cancelledReservations',
      )
      .addSelect(
        "SUM(CASE WHEN reservation.status = 'PENDING' THEN 1 ELSE 0 END)",
        'pendingReservations',
      )
      .addSelect(
        'SUM(CASE WHEN reservation.reservationDate >= CURRENT_DATE THEN 1 ELSE 0 END)',
        'upcomingReservations',
      )
      .addSelect(
        'AVG(reservation.numberOfGuests)',
        'averageGuestsPerReservation',
      );

    return qb;
  }

  private buildStatusDistributionQuery(
    filters: ReservationAnalyticsQuery,
  ): SelectQueryBuilder<ReservationOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .select('reservation.status', 'status')
      .addSelect('COUNT(reservation.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('reservation.status').orderBy('count', 'DESC');

    return qb;
  }

  private buildGuestDistributionQuery(
    filters: ReservationAnalyticsQuery,
  ): SelectQueryBuilder<ReservationOrmEntity> {
    const qb = this.repository.createQueryBuilder('reservation');

    this.applyFilters(qb, filters);

    qb.select(
      `CASE
        WHEN reservation.numberOfGuests <= 2 THEN 'COUPLE'
        WHEN reservation.numberOfGuests <= 4 THEN 'FAMILY'
        WHEN reservation.numberOfGuests <= 6 THEN 'GROUP'
        ELSE 'EVENT'
      END`,
      'segment',
    )
      .addSelect('COUNT(reservation.id)', 'count')
      .groupBy('segment')
      .orderBy('segment', 'ASC');

    return qb;
  }

  private buildRestaurantDistributionQuery(
    filters: ReservationAnalyticsQuery,
  ): SelectQueryBuilder<ReservationOrmEntity> {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .select('reservation.restaurant_id', 'restaurantId')
      .addSelect('COUNT(reservation.id)', 'count');

    this.applyFilters(qb, filters);

    qb.groupBy('reservation.restaurant_id').orderBy('count', 'DESC');

    return qb;
  }

  private buildHourDistributionQuery(
    filters: ReservationAnalyticsQuery,
  ): SelectQueryBuilder<ReservationOrmEntity> {
    const qb = this.repository.createQueryBuilder('reservation');

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const hourExpression =
      dialect === 'postgres'
        ? 'EXTRACT(HOUR FROM reservation.reservationTime)'
        : "CAST(strftime('%H', reservation.reservationTime) AS INTEGER)";

    qb.select(hourExpression, 'hour')
      .addSelect('COUNT(reservation.id)', 'count')
      .groupBy(hourExpression)
      .orderBy(hourExpression, 'ASC');

    return qb;
  }

  private buildTrendQuery(
    filters: ReservationAnalyticsQuery,
  ): SelectQueryBuilder<ReservationOrmEntity> {
    const qb = this.repository.createQueryBuilder('reservation');

    this.applyFilters(qb, filters);

    const connection = this.repository.manager.connection;
    const dialect = connection.options.type;

    const dateExpression =
      dialect === 'postgres'
        ? "TO_CHAR(reservation.reservationDate, 'YYYY-MM-DD')"
        : "strftime('%Y-%m-%d', reservation.reservationDate)";

    qb.select(dateExpression, 'date')
      .addSelect('COUNT(reservation.id)', 'count')
      .addSelect('SUM(reservation.numberOfGuests)', 'guests')
      .groupBy(dateExpression)
      .orderBy(dateExpression, 'ASC');

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<ReservationOrmEntity>,
    filters: ReservationAnalyticsQuery,
  ): void {
    if (filters.startDate) {
      qb.andWhere('reservation.reservationDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('reservation.reservationDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.restaurantId) {
      qb.andWhere('reservation.restaurant_id = :restaurantId', {
        restaurantId: filters.restaurantId,
      });
    }

    if (filters.status) {
      qb.andWhere('reservation.status = :status', { status: filters.status });
    }

    if (typeof filters.minGuests === 'number') {
      qb.andWhere('reservation.numberOfGuests >= :minGuests', {
        minGuests: filters.minGuests,
      });
    }

    if (typeof filters.maxGuests === 'number') {
      qb.andWhere('reservation.numberOfGuests <= :maxGuests', {
        maxGuests: filters.maxGuests,
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
