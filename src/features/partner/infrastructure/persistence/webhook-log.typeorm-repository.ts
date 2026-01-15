/**
 * Webhook Log TypeORM Repository
 *
 * Implementation of IWebhookLogRepositoryPort using TypeORM.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { WebhookLog, IWebhookLogRepositoryPort } from '../../domain';
import { WebhookLogOrmEntity } from './webhook-log.orm-entity';
import { WebhookLogOrmMapper } from './webhook-log.orm-mapper';

@Injectable()
export class WebhookLogTypeOrmRepository extends IWebhookLogRepositoryPort {
  constructor(
    @InjectRepository(WebhookLogOrmEntity)
    private readonly repository: Repository<WebhookLogOrmEntity>,
    private readonly mapper: WebhookLogOrmMapper,
  ) {
    super();
  }

  async save(log: WebhookLog): Promise<WebhookLog> {
    const orm = this.mapper.toOrm(log);
    const saved = await this.repository.save(orm);
    return this.mapper.toDomain(saved);
  }

  async findById(id: string): Promise<WebhookLog | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByPartnerId(
    partnerId: string,
    limit = 50,
    offset = 0,
  ): Promise<WebhookLog[]> {
    const orms = await this.repository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findPendingRetries(maxRetries: number): Promise<WebhookLog[]> {
    const orms = await this.repository.find({
      where: {
        status: In(['failed', 'retrying']),
        retryCount: LessThan(maxRetries),
      },
      order: { createdAt: 'ASC' },
      take: 100,
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async countByPartnerAndStatus(
    partnerId: string,
    status: string,
  ): Promise<number> {
    return this.repository.count({
      where: { partnerId, status },
    });
  }
}
