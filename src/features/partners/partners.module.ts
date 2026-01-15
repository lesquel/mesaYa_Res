/**
 * Partners Module
 *
 * B2B partner webhook integration module.
 * Provides:
 * - Partner registration API
 * - HMAC-SHA256 webhook authentication
 * - Webhook dispatcher with retry logic
 * - Event subscription management
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { PartnerOrmEntity } from './infrastructure/persistence/partner.orm-entity';
import { PartnerRepository } from './infrastructure/persistence/partner.repository';

// Application Services
import { HmacWebhookService } from './application/services/hmac-webhook.service';
import { PartnerWebhookDispatcher } from './application/services/partner-webhook-dispatcher.service';
import { WebhookEventConsumer } from './application/webhook-event.consumer';

// Presentation
import { PartnersController } from './presentation/controllers/partners.controller';

// Shared
import { KafkaModule } from '@shared/infrastructure/kafka';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerOrmEntity]), KafkaModule],
  controllers: [PartnersController],
  providers: [
    // Repository
    PartnerRepository,
    // Services
    HmacWebhookService,
    PartnerWebhookDispatcher,
    // Consumers
    WebhookEventConsumer,
  ],
  exports: [PartnerRepository, HmacWebhookService, PartnerWebhookDispatcher],
})
export class PartnersModule {}
