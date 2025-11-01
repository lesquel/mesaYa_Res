import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AdminPaymentController,
  UserPaymentController,
  RestaurantPaymentController,
} from './presentation';
import {
  PaymentTypeOrmRepository,
  PaymentOrmEntity,
  PaymentOrmMapper,
  PaymentAnalyticsTypeOrmRepository,
} from './infrastructure';
import {
  PaymentService,
  PaymentEntityDTOMapper,
  GetPaymentAnalyticsUseCase,
  PaymentAccessService,
} from './application';
import { IPaymentRepositoryPort } from './domain';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  PAYMENT_ORM_MAPPER,
  PAYMENT_ANALYTICS_REPOSITORY,
} from './payment.tokens';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { KafkaService } from '@shared/infrastructure/kafka';
import { ReservationOrmEntity } from '@features/reservation';
import { SubscriptionOrmEntity } from '@features/subscription';
import { RestaurantOrmEntity } from '@features/restaurants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentOrmEntity,
      ReservationOrmEntity,
      SubscriptionOrmEntity,
      RestaurantOrmEntity,
    ]),
    LoggerModule,
  ],
  controllers: [
    AdminPaymentController,
    UserPaymentController,
    RestaurantPaymentController,
  ],
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
    PaymentAccessService,
    {
      provide: PaymentService,
      useFactory: (
        logger: ILoggerPort,
        paymentRepository: IPaymentRepositoryPort,
        mapper: PaymentEntityDTOMapper,
        kafkaService: KafkaService,
        accessService: PaymentAccessService,
      ) =>
        new PaymentService(
          logger,
          paymentRepository,
          mapper,
          kafkaService,
          accessService,
        ),
      inject: [
        LOGGER,
        IPaymentRepositoryPort,
        PaymentEntityDTOMapper,
        KafkaService,
        PaymentAccessService,
      ],
    },
    GetPaymentAnalyticsUseCase,
  ],
  exports: [PaymentService, GetPaymentAnalyticsUseCase, IPaymentRepositoryPort],
})
export class PaymentModule {}
