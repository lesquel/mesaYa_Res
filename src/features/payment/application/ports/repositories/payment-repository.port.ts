import {
  PaymentCreate,
  PaymentEntity,
  PaymentUpdate,
} from '@features/payment/domain';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

export abstract class IPaymentRepositoryPort extends IBaseRepositoryPort<
  PaymentEntity,
  PaymentCreate,
  PaymentUpdate
> {}
