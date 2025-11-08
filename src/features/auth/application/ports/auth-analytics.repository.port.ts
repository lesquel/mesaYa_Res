import type { AuthAnalyticsQuery } from '../dto/queries/auth-analytics.query';
import type { AuthAnalyticsRepositoryResult } from '../dto/responses/auth-analytics.response';

export interface AuthAnalyticsRepositoryPort {
  compute(query: AuthAnalyticsQuery): Promise<AuthAnalyticsRepositoryResult>;
}
