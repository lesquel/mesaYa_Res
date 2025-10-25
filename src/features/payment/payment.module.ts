import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentController } from './presentation/index';
import {
  PaymentTypeOrmRepository,
  PaymentOrmEntity,
  PaymentOrmMapper,
  PaymentAnalyticsTypeOrmRepository,
} from './infrastructure/index';
import {
  PaymentService,
  PaymentEntityDTOMapper,
  GetPaymentAnalyticsUseCase,
} from './application/index';
import { IPaymentRepositoryPort } from './domain/index';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  PAYMENT_ORM_MAPPER,
  PAYMENT_ANALYTICS_REPOSITORY,
} from './payment.tokens';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { KafkaService } from '@shared/infrastructure/kafka';

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
      provide: PAYMENT_ANALYTICS_REPOSITORY,
      useClass: PaymentAnalyticsTypeOrmRepository,
    },
    {
      provide: PaymentService,
      useFactory: (
        logger: ILoggerPort,
        paymentRepository: IPaymentRepositoryPort,
        mapper: PaymentEntityDTOMapper,
        kafkaService: KafkaService,
      ) => new PaymentService(logger, paymentRepository, mapper, kafkaService),
      inject: [
        LOGGER,
        IPaymentRepositoryPort,
        PaymentEntityDTOMapper,
        KafkaService,
      ],
    },
    GetPaymentAnalyticsUseCase,
  ],
  exports: [PaymentService, GetPaymentAnalyticsUseCase],
})
export class PaymentModule {}
