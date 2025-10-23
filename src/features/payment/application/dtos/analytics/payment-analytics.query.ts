import type { PaymentStatusEnum, PaymentTypeEnum } from '../../../domain/enums';

export interface PaymentAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly status?: PaymentStatusEnum;
  readonly type?: PaymentTypeEnum;
  readonly restaurantId?: string;
  readonly minAmount?: number;
  readonly maxAmount?: number;
}
