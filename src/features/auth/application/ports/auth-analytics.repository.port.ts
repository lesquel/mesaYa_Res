import type { AuthAnalyticsQuery } from '../dto/queries/auth-analytics.query';
import type { AuthAnalyticsRepositoryResult } from '../dto/responses/auth-analytics.response';

export const AUTH_ANALYTICS_REPOSITORY = Symbol('AUTH_ANALYTICS_REPOSITORY');

export interface AuthAnalyticsRepositoryPort {
  compute(query: AuthAnalyticsQuery): Promise<AuthAnalyticsRepositoryResult>;
}
