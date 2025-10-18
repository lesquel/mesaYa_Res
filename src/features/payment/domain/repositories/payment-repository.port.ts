import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

import {
  PaymentCreate,
  PaymentEntity,
  PaymentUpdate,
} from '@features/payment/domain';

export abstract class IPaymentRepositoryPort extends IBaseRepositoryPort<
  PaymentEntity,
  PaymentCreate,
  PaymentUpdate
> {}
