import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentController } from './presentation';
import {
  PaymentTypeOrmRepository,
  PaymentOrmEntity,
  PaymentOrmMapper,
} from './infrastructure';
import {
  PaymentService,
  PaymentEntityDTOMapper,
  PAYMENT_ORM_MAPPER,
} from './application';
import { IPaymentRepositoryPort } from './domain';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity])],
  controllers: [PaymentController],
  providers: [
    PaymentEntityDTOMapper,
    {
      provide: PAYMENT_ORM_MAPPER,
      useClass: PaymentOrmMapper,
    },
    {
      provide: IPaymentRepositoryPort,
      useClass: PaymentTypeOrmRepository,
    },
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
