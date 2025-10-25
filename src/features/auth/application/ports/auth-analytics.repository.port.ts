import type { AuthAnalyticsQuery } from '../dto/queries/auth-analytics.query.js';
import type { AuthAnalyticsRepositoryResult } from '../dto/responses/auth-analytics.response.js';

export interface AuthAnalyticsRepositoryPort {
  compute(query: AuthAnalyticsQuery): Promise<AuthAnalyticsRepositoryResult>;
}
