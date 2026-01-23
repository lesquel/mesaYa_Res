import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  PaymentWebhookController,
  PaymentGatewayController,
  N8nPaymentWebhookController,
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
import { ReservationOrmEntity, ReservationModule } from '@features/reservation';
import { SubscriptionOrmEntity } from '@features/subscription';
import { RestaurantOrmEntity } from '@features/restaurants';

/**
 * Payment Module
 *
 * This module acts as an API Gateway for payment operations.
 * All actual payment processing is handled by the Payment Microservice (mesaYA_payment_ms).
 *
 * The PaymentGatewayController proxies requests to the Payment MS while adding:
 * - Authentication and authorization
 * - Business logic validation (reservation ownership, etc.)
 * - Webhook notifications to registered partners
 *
 * Legacy controllers (PaymentsController, PaymentsAdminController, etc.) have been
 * removed as part of the refactoring to use the Payment MS as the single source of truth.
 */
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
    // Import ReservationModule for ChangeReservationStatusUseCase (used by N8n webhook)
    forwardRef(() => ReservationModule),
  ],
  controllers: [
    // API Gateway controller - proxies requests to Payment MS
    PaymentGatewayController,
    // Webhook controller for Stripe/provider callbacks
    PaymentWebhookController,
    // N8n webhook controller - handles n8n workflow callbacks
    N8nPaymentWebhookController,
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
    // Note: This is used by PaymentWebhookController for Stripe webhook verification
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
    // Application Services - kept for analytics and access control
    PaymentAccessService,
    // Use Cases - required by PaymentService (exported for other modules)
    CreatePaymentUseCase,
    GetPaymentByIdUseCase,
    GetAllPaymentsUseCase,
    UpdatePaymentStatusUseCase,
    DeletePaymentUseCase,
    GetPaymentAnalyticsUseCase,
    // Main Application Service - kept for backward compatibility with other modules
    PaymentService,
  ],
  exports: [
    PaymentService,
    CreatePaymentUseCase,
    GetPaymentAnalyticsUseCase,
    IPaymentRepositoryPort,
    PAYMENT_GATEWAY,
    PaymentMsClientService,
  ],
})
export class PaymentModule {}
