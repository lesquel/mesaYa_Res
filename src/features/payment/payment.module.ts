import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentController } from './presentation/index';
import {
  PaymentTypeOrmRepository,
  PaymentOrmEntity,
  PaymentOrmMapper,
} from './infrastructure/index';
import {
  PaymentService,
  PaymentEntityDTOMapper,
  PAYMENT_ORM_MAPPER,
} from './application/index';
import { IPaymentRepositoryPort } from './domain/index';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity]), LoggerModule],
  controllers: [PaymentController],
  providers: [
    {
      provide: PaymentEntityDTOMapper,
      useFactory: () => new PaymentEntityDTOMapper(),
    },
    {
      provide: PAYMENT_ORM_MAPPER,
      useClass: PaymentOrmMapper,
    },
    {
      provide: IPaymentRepositoryPort,
      useClass: PaymentTypeOrmRepository,
    },
    {
      provide: PaymentService,
      useFactory: (
        logger: ILoggerPort,
        paymentRepository: IPaymentRepositoryPort,
        mapper: PaymentEntityDTOMapper,
      ) => new PaymentService(logger, paymentRepository, mapper),
      inject: [LOGGER, IPaymentRepositoryPort, PaymentEntityDTOMapper],
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
