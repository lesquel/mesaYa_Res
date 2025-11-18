import { PaginationQuery } from '@shared/application/types/pagination';
import { PaymentStatusEnum, PaymentTypeEnum } from '@features/payment/domain/enums';

export interface ListPaymentsQuery {
  pagination: PaginationQuery;
  route: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: PaymentStatusEnum;
  type?: PaymentTypeEnum;
  reservationId?: string;
  restaurantId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}
