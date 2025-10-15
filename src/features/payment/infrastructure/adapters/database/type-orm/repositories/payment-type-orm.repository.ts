import { Injectable } from '@nestjs/common';

import { IPaymentRepositoryPort } from '@features/payment/application/ports/repositories';
import {
  PaymentCreatePort,
  PaymentUpdatePort,
} from '@features/payment/application/ports/models/payment-repository.port-models.js';
import { PaymentEntity } from '@features/payment/domain';

@Injectable()
export class PaymentTypeOrmRepository extends IPaymentRepositoryPort {
  create(_data: PaymentCreatePort): Promise<PaymentEntity> {
    void _data;
    throw new Error('Method not implemented.');
  }

  delete(_id: string): Promise<boolean> {
    void _id;
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<PaymentEntity[]> {
    throw new Error('Method not implemented.');
  }
  findById(_id: string): Promise<PaymentEntity | null> {
    void _id;
    throw new Error('Method not implemented.');
  }
  update(_data: PaymentUpdatePort): Promise<PaymentEntity | null> {
    void _data;
    throw new Error('Method not implemented.');
  }
}
