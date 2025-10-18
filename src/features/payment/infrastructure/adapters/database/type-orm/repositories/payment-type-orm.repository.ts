import { Injectable } from '@nestjs/common';

import { IPaymentRepositoryPort } from '@features/payment/domain/repositories';
import { PaymentEntity } from '@features/payment/domain';

@Injectable()
export class PaymentTypeOrmRepository extends IPaymentRepositoryPort {
  create(_data: any): Promise<PaymentEntity> {
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
  update(_data: any): Promise<PaymentEntity | null> {
    void _data;
    throw new Error('Method not implemented.');
  }
}
