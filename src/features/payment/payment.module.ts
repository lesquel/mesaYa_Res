import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentController } from './presentation/index.js';
import {
  PaymentTypeOrmRepository,
  PaymentOrmEntity,
  PaymentOrmMapper,
} from './infrastructure/index.js';
import {
  PaymentService,
  PaymentEntityDTOMapper,
  PAYMENT_ORM_MAPPER,
} from './application/index.js';
import { IPaymentRepositoryPort } from './domain/index.js';

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
