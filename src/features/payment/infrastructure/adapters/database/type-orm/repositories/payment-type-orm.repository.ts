import { Injectable } from '@nestjs/common';

import { IPaymentRepositoryPort } from '@features/payment/application/ports/repositories';
import {
  PaymentCreate,
  PaymentEntity,
  PaymentUpdate,
} from '@features/payment/domain';

@Injectable()
export class PaymentTypeOrmRepository extends IPaymentRepositoryPort {
  create(data: PaymentCreate): Promise<PaymentEntity> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<PaymentEntity[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<PaymentEntity | null> {
    throw new Error('Method not implemented.');
  }
  update(data: PaymentUpdate): Promise<PaymentEntity | null> {
    throw new Error('Method not implemented.');
  }
}
