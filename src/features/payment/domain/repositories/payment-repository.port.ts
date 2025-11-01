import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

import {
  PaymentCreate,
  PaymentEntity,
  PaymentUpdate,
} from '@features/payment/domain';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListPaymentsQuery } from '@features/payment/application/dtos/input/list-payments.query';

export abstract class IPaymentRepositoryPort extends IBaseRepositoryPort<
  PaymentEntity,
  PaymentCreate,
  PaymentUpdate
> {
  abstract findByReservationId(reservationId: string): Promise<PaymentEntity[]>;
  abstract findBySubscriptionId(
    subscriptionId: string,
  ): Promise<PaymentEntity[]>;
  abstract findByRestaurantId(restaurantId: string): Promise<PaymentEntity[]>;
  abstract paginate(
    query: ListPaymentsQuery,
  ): Promise<PaginatedResult<PaymentEntity>>;
}
