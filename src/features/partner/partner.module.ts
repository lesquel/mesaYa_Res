/**
 * Partner Module
 *
 * B2B Partner management and webhook interoperability.
 *
 * Features:
 * - Partner registration with HMAC secret generation
 * - Outgoing webhooks to partners (event-driven)
 * - Incoming webhooks from partners (bidirectional)
 * - Webhook logging and retry logic
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Infrastructure - Persistence
import {
  PartnerOrmEntity,
  WebhookLogOrmEntity,
  PartnerTypeOrmRepository,
  WebhookLogTypeOrmRepository,
} from './infrastructure/persistence';

// Application Services
import {
  HmacService,
  PartnerService,
  WebhookDispatcherService,
  PartnerWebhookHandlerService,
} from './application/services';

// Presentation
import {
  PartnerController,
  PartnerWebhookController,
} from './presentation/controllers';

// Injection tokens for repository ports
export const PARTNER_REPOSITORY = Symbol('IPartnerRepositoryPort');
export const WEBHOOK_LOG_REPOSITORY = Symbol('IWebhookLogRepositoryPort');

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PartnerOrmEntity, WebhookLogOrmEntity]),
  ],
  controllers: [PartnerController, PartnerWebhookController],
  providers: [
    // Repository implementations
    {
      provide: PARTNER_REPOSITORY,
      useClass: PartnerTypeOrmRepository,
    },
    {
      provide: WEBHOOK_LOG_REPOSITORY,
      useClass: WebhookLogTypeOrmRepository,
    },

    // Application services
    HmacService,
    {
      provide: PartnerService,
      useFactory: (
        partnerRepo: PartnerTypeOrmRepository,
        hmacService: HmacService,
      ) => new PartnerService(partnerRepo, hmacService),
      inject: [PARTNER_REPOSITORY, HmacService],
    },
    {
      provide: WebhookDispatcherService,
      useFactory: (
        partnerRepo: PartnerTypeOrmRepository,
        webhookLogRepo: WebhookLogTypeOrmRepository,
        hmacService: HmacService,
        configService: ConfigService,
      ) => new WebhookDispatcherService(partnerRepo, webhookLogRepo, hmacService, configService),
      inject: [PARTNER_REPOSITORY, WEBHOOK_LOG_REPOSITORY, HmacService, ConfigService],
    },
    {
      provide: PartnerWebhookHandlerService,
      useFactory: (
        partnerRepo: PartnerTypeOrmRepository,
        webhookLogRepo: WebhookLogTypeOrmRepository,
        hmacService: HmacService,
      ) =>
        new PartnerWebhookHandlerService(partnerRepo, webhookLogRepo, hmacService),
      inject: [PARTNER_REPOSITORY, WEBHOOK_LOG_REPOSITORY, HmacService],
    },
  ],
  exports: [
    // Export dispatcher for other modules to trigger webhooks
    WebhookDispatcherService,
    // Export service for cross-module partner queries
    PartnerService,
    // Export repository tokens for advanced use cases
    PARTNER_REPOSITORY,
    WEBHOOK_LOG_REPOSITORY,
  ],
})
export class PartnerModule {}
