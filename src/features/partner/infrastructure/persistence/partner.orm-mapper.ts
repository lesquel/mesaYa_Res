/**
 * Partner ORM Mapper
 *
 * Maps between Partner domain entity and PartnerOrmEntity.
 */

import { Injectable } from '@nestjs/common';
import {
  Partner,
  PartnerEventType,
  PartnerStatus,
} from '../../domain/entities/partner.entity';
import { PartnerOrmEntity } from './partner.orm-entity';

@Injectable()
export class PartnerOrmMapper {
  toDomain(orm: PartnerOrmEntity): Partner {
    return new Partner({
      id: orm.id,
      name: orm.name,
      webhookUrl: orm.webhookUrl,
      secret: orm.secret,
      subscribedEvents: orm.subscribedEvents as PartnerEventType[],
      status: orm.status as PartnerStatus,
      description: orm.description,
      contactEmail: orm.contactEmail,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      lastWebhookAt: orm.lastWebhookAt,
      failedWebhookCount: orm.failedWebhookCount,
    });
  }

  toOrm(domain: Partner): PartnerOrmEntity {
    const orm = new PartnerOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.webhookUrl = domain.webhookUrl;
    orm.secret = domain.secret;
    orm.subscribedEvents = domain.subscribedEvents;
    orm.status = domain.status;
    orm.description = domain.description;
    orm.contactEmail = domain.contactEmail;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.lastWebhookAt = domain.lastWebhookAt;
    orm.failedWebhookCount = domain.failedWebhookCount;
    return orm;
  }
}
