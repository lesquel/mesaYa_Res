import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  PaymentsController,
  PaymentWebhookController,
  PaymentGatewayController,
} from './presentation';
import {
  PaymentTypeOrmRepository,
  PaymentOrmEntity,
  PaymentOrmMapper,
  PaymentAnalyticsTypeOrmRepository,
  StripeAdapter,
  MockPaymentAdapter,
  PaymentMsClientService,
  PaymentTargetAdapter,
} from './infrastructure';
import {
  PaymentService,
  PaymentEntityDTOMapper,
  GetPaymentAnalyticsUseCase,
  PaymentAccessService,
  CreatePaymentUseCase,
  GetPaymentByIdUseCase,
  GetAllPaymentsUseCase,
  UpdatePaymentStatusUseCase,
  DeletePaymentUseCase,
} from './application';
import { IPaymentRepositoryPort, PaymentDomainService } from './domain';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import {
  PAYMENT_ORM_MAPPER,
  PAYMENT_ANALYTICS_REPOSITORY,
  PAYMENT_GATEWAY,
  PAYMENT_TARGET_PORT,
} from './payment.tokens';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { KafkaService } from '@shared/infrastructure/kafka';
import { ReservationOrmEntity } from '@features/reservation';
import { SubscriptionOrmEntity } from '@features/subscription';
import { RestaurantOrmEntity } from '@features/restaurants';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      PaymentOrmEntity,
      // External entities needed for PaymentTargetAdapter
      ReservationOrmEntity,
      SubscriptionOrmEntity,
      RestaurantOrmEntity,
    ]),
    LoggerModule,
  ],
  controllers: [
    PaymentsController,
    PaymentWebhookController,
    PaymentGatewayController,
  ],
  providers: [
    // Payment Microservice Client (API Gateway pattern)
    PaymentMsClientService,
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
    // Payment Gateway Adapter (Stripe in production, Mock in development)
    {
      provide: PAYMENT_GATEWAY,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const useRealStripe = configService.get<string>(
          'USE_REAL_STRIPE',
          'false',
        );

        // Use MockPaymentAdapter in development unless explicitly configured
        if (nodeEnv === 'development' && useRealStripe !== 'true') {
          return new MockPaymentAdapter();
        }
        return new StripeAdapter(configService);
      },
      inject: [ConfigService],
    },
    // Target Port Adapter (access to Reservation/Subscription ownership)
    {
      provide: PAYMENT_TARGET_PORT,
      useClass: PaymentTargetAdapter,
    },
    // Domain Services
    PaymentDomainService,
    // Application Services
    PaymentAccessService,
    // Use Cases (now @Injectable with DI)
    CreatePaymentUseCase,
    GetPaymentByIdUseCase,
    GetAllPaymentsUseCase,
    UpdatePaymentStatusUseCase,
    DeletePaymentUseCase,
    GetPaymentAnalyticsUseCase,
    // Main Application Service
    PaymentService,
  ],
  exports: [
    PaymentService,
    GetPaymentAnalyticsUseCase,
    IPaymentRepositoryPort,
    PAYMENT_GATEWAY,
    PaymentMsClientService,
  ],
})
export class PaymentModule {}
