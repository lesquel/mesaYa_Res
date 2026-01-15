/**
 * Webhook Log ORM Mapper
 *
 * Maps between WebhookLog domain entity and WebhookLogOrmEntity.
 */

import { Injectable } from '@nestjs/common';
import {
  WebhookLog,
  WebhookDirection,
  WebhookStatus,
} from '../../domain/entities/webhook-log.entity';
import { WebhookLogOrmEntity } from './webhook-log.orm-entity';

@Injectable()
export class WebhookLogOrmMapper {
  toDomain(orm: WebhookLogOrmEntity): WebhookLog {
    return new WebhookLog({
      id: orm.id,
      partnerId: orm.partnerId,
      direction: orm.direction as WebhookDirection,
      eventType: orm.eventType,
      payload: orm.payload,
      status: orm.status as WebhookStatus,
      statusCode: orm.statusCode,
      responseBody: orm.responseBody,
      errorMessage: orm.errorMessage,
      retryCount: orm.retryCount,
      createdAt: orm.createdAt,
      completedAt: orm.completedAt,
    });
  }

  toOrm(domain: WebhookLog): WebhookLogOrmEntity {
    const orm = new WebhookLogOrmEntity();
    orm.id = domain.id;
    orm.partnerId = domain.partnerId;
    orm.direction = domain.direction;
    orm.eventType = domain.eventType;
    orm.payload = domain.payload;
    orm.status = domain.status;
    orm.statusCode = domain.statusCode;
    orm.responseBody = domain.responseBody;
    orm.errorMessage = domain.errorMessage;
    orm.retryCount = domain.retryCount;
    orm.createdAt = domain.createdAt;
    orm.completedAt = domain.completedAt;
    return orm;
  }
}
