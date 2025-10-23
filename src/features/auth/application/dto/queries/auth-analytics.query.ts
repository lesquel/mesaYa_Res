export interface AuthAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly role?: string;
  readonly active?: boolean;
}
