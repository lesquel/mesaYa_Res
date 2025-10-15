import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import {
  PaymentCreatePort,
  PaymentUpdatePort,
} from '../models/payment-repository.port-models.js';
import { PaymentEntity } from '@features/payment/domain';

export abstract class IPaymentRepositoryPort extends IBaseRepositoryPort<
  PaymentEntity,
  PaymentCreatePort,
  PaymentUpdatePort
> {}
