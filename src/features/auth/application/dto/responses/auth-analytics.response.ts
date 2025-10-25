export interface AuthAnalyticsDistributionItem {
  readonly label: string;
  readonly count: number;
}

export interface AuthAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface AuthAnalyticsSummary {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly inactiveUsers: number;
  readonly activePercentage: number;
  readonly averageRegistrationsPerDay: number;
}

export interface AuthAnalyticsRegistrations {
  readonly total: number;
  readonly byDate: AuthAnalyticsTrendPoint[];
}

export interface AuthAnalyticsResponse {
  readonly summary: AuthAnalyticsSummary;
  readonly registrations: AuthAnalyticsRegistrations;
  readonly roles: AuthAnalyticsDistributionItem[];
  readonly permissions: AuthAnalyticsDistributionItem[];
}

export interface AuthAnalyticsRepositoryTotals {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly inactiveUsers: number;
}

export interface AuthAnalyticsRepositoryResult {
  readonly totals: AuthAnalyticsRepositoryTotals;
  readonly roleDistribution: Array<{ role: string; count: number }>;
  readonly permissionDistribution: Array<{ permission: string; count: number }>;
  readonly registrationsByDate: AuthAnalyticsTrendPoint[];
}
