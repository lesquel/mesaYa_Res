import type { ReservationStatus } from '../../../domain/types/reservation-status.type';

export interface ReservationAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
  readonly guests: number;
}

export interface ReservationAnalyticsSummary {
  readonly totalReservations: number;
  readonly confirmedReservations: number;
  readonly pendingReservations: number;
  readonly cancelledReservations: number;
  readonly upcomingReservations: number;
  readonly averageGuestsPerReservation: number;
  readonly confirmationRate: number;
}

export interface ReservationAnalyticsResponse {
  readonly summary: ReservationAnalyticsSummary;
  readonly reservations: {
    readonly total: number;
    readonly byDate: ReservationAnalyticsTrendPoint[];
  };
  readonly statuses: Array<{
    readonly status: ReservationStatus;
    readonly count: number;
  }>;
  readonly guestSegments: Array<{
    readonly segment: string;
    readonly count: number;
  }>;
  readonly restaurants: Array<{
    readonly restaurantId: string;
    readonly count: number;
  }>;
  readonly peakHours: Array<{
    readonly hour: number;
    readonly count: number;
  }>;
}

export interface ReservationAnalyticsRepositoryTotals {
  readonly totalReservations: number;
  readonly confirmedReservations: number;
  readonly cancelledReservations: number;
  readonly pendingReservations: number;
  readonly upcomingReservations: number;
  readonly averageGuestsPerReservation: number;
}

export interface ReservationAnalyticsRepositoryResult {
  readonly totals: ReservationAnalyticsRepositoryTotals;
  readonly reservationsByDate: ReservationAnalyticsTrendPoint[];
  readonly statusDistribution: Array<{
    status: ReservationStatus;
    count: number;
  }>;
  readonly guestDistribution: Array<{ segment: string; count: number }>;
  readonly restaurantDistribution: Array<{
    restaurantId: string;
    count: number;
  }>;
  readonly hourDistribution: Array<{ hour: number; count: number }>;
}
