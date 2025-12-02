import { Inject, Injectable } from '@nestjs/common';
import { toRounded } from '@shared/application/utils';
import type { ReservationAnalyticsQuery } from '../dto/analytics/reservation-analytics.query';
import type {
  ReservationAnalyticsResponse,
  ReservationAnalyticsRepositoryResult,
} from '../dto/analytics/reservation-analytics.response';
import {
  RESERVATION_ANALYTICS_REPOSITORY,
  type ReservationAnalyticsRepositoryPort,
} from '../ports/reservation-analytics.repository.port';

@Injectable()
export class GetReservationAnalyticsUseCase {
  constructor(
    @Inject(RESERVATION_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: ReservationAnalyticsRepositoryPort,
  ) {}

  async execute(
    query: ReservationAnalyticsQuery,
  ): Promise<ReservationAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    const confirmationRate = this.calculateConfirmationRate(analytics);

    return {
      summary: {
        totalReservations: analytics.totals.totalReservations,
        confirmedReservations: analytics.totals.confirmedReservations,
        pendingReservations: analytics.totals.pendingReservations,
        cancelledReservations: analytics.totals.cancelledReservations,
        upcomingReservations: analytics.totals.upcomingReservations,
        averageGuestsPerReservation: toRounded(
          analytics.totals.averageGuestsPerReservation,
        ),
        confirmationRate,
      },
      reservations: {
        total: analytics.totals.totalReservations,
        byDate: analytics.reservationsByDate.map((point) => ({
          date: point.date,
          count: point.count,
          guests: point.guests,
        })),
      },
      statuses: analytics.statusDistribution.map((row) => ({
        status: row.status,
        count: row.count,
      })),
      guestSegments: analytics.guestDistribution.map((row) => ({
        segment: this.resolveGuestSegmentLabel(row.segment),
        count: row.count,
      })),
      restaurants: analytics.restaurantDistribution.map((row) => ({
        restaurantId: row.restaurantId,
        count: row.count,
      })),
      peakHours: analytics.hourDistribution.map((row) => ({
        hour: row.hour,
        count: row.count,
      })),
    };
  }

  private calculateConfirmationRate(
    analytics: ReservationAnalyticsRepositoryResult,
  ): number {
    if (analytics.totals.totalReservations === 0) {
      return 0;
    }

    const rate =
      (analytics.totals.confirmedReservations /
        analytics.totals.totalReservations) *
      100;
    return toRounded(rate);
  }

  private resolveGuestSegmentLabel(segment: string): string {
    switch (segment) {
      case 'COUPLE':
        return 'Parejas (1-2)';
      case 'FAMILY':
        return 'Familias (3-4)';
      case 'GROUP':
        return 'Grupos (5-6)';
      case 'EVENT':
        return 'Eventos (7 o más)';
      default:
        return segment;
    }
  }
}
