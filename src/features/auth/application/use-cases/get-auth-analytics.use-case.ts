import { Inject, Injectable } from '@nestjs/common';
import type { AuthAnalyticsQuery } from '../dto/queries/auth-analytics.query.js';
import type {
  AuthAnalyticsRepositoryResult,
  AuthAnalyticsResponse,
  AuthAnalyticsTrendPoint,
} from '../dto/responses/auth-analytics.response.js';
import { type AuthAnalyticsRepositoryPort } from '../ports/auth-analytics.repository.port';
import { AUTH_ANALYTICS_REPOSITORY } from '@features/auth/auth.tokens.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class GetAuthAnalyticsUseCase {
  constructor(
    @Inject(AUTH_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: AuthAnalyticsRepositoryPort,
  ) {}

  async execute(query: AuthAnalyticsQuery): Promise<AuthAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    const totalRegistrations = analytics.registrationsByDate.reduce(
      (acc, point) => acc + point.count,
      0,
    );

    const activePercentage =
      analytics.totals.totalUsers > 0
        ? Number(
            (
              (analytics.totals.activeUsers / analytics.totals.totalUsers) *
              100
            ).toFixed(2),
          )
        : 0;

    const averagePerDay = this.calculateAverageRegistrationsPerDay(
      analytics,
      query,
    );

    return {
      summary: {
        totalUsers: analytics.totals.totalUsers,
        activeUsers: analytics.totals.activeUsers,
        inactiveUsers: analytics.totals.inactiveUsers,
        activePercentage,
        averageRegistrationsPerDay: averagePerDay,
      },
      registrations: {
        total: totalRegistrations,
        byDate: analytics.registrationsByDate,
      },
      roles: analytics.roleDistribution.map((item) => ({
        label: item.role,
        count: item.count,
      })),
      permissions: analytics.permissionDistribution.map((item) => ({
        label: item.permission,
        count: item.count,
      })),
    };
  }

  private calculateAverageRegistrationsPerDay(
    analytics: AuthAnalyticsRepositoryResult,
    query: AuthAnalyticsQuery,
  ): number {
    const points = analytics.registrationsByDate;
    if (!points.length) {
      return 0;
    }

    const total = points.reduce((acc, point) => acc + point.count, 0);

    const firstDate = this.resolveStartDate(points, query);
    const lastDate = this.resolveEndDate(points, query);
    if (!firstDate || !lastDate) {
      return Number(total.toFixed(2));
    }

    const diffDays =
      Math.floor((lastDate.getTime() - firstDate.getTime()) / MS_PER_DAY) + 1;

    if (diffDays <= 0) {
      return Number(total.toFixed(2));
    }

    return Number((total / diffDays).toFixed(2));
  }

  private resolveStartDate(
    points: AuthAnalyticsTrendPoint[],
    query: AuthAnalyticsQuery,
  ): Date | null {
    if (query.startDate) {
      return this.normalizeDateStart(query.startDate);
    }
    return this.parsePointDate(points[0]);
  }

  private resolveEndDate(
    points: AuthAnalyticsTrendPoint[],
    query: AuthAnalyticsQuery,
  ): Date | null {
    if (query.endDate) {
      return this.normalizeDateEnd(query.endDate);
    }
    return this.parsePointDate(points[points.length - 1], true);
  }

  private parsePointDate(
    point: AuthAnalyticsTrendPoint,
    endOfDay = false,
  ): Date | null {
    const raw = point.date;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      const fallback = new Date(`${raw}T00:00:00Z`);
      if (Number.isNaN(fallback.getTime())) {
        return null;
      }
      if (endOfDay) {
        fallback.setUTCHours(23, 59, 59, 999);
      } else {
        fallback.setUTCHours(0, 0, 0, 0);
      }
      return fallback;
    }
    if (endOfDay) {
      parsed.setHours(23, 59, 59, 999);
    } else {
      parsed.setHours(0, 0, 0, 0);
    }
    return parsed;
  }

  private normalizeDateStart(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private normalizeDateEnd(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(23, 59, 59, 999);
    return normalized;
  }
}
