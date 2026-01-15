/**
 * Partner Repository Implementation
 *
 * TypeORM repository for partner CRUD operations.
 * Implements IPartnerRepository interface for domain layer.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerOrmEntity, PartnerStatusORM } from './partner.orm-entity';
import { PartnerEntity, PartnerStatus, PartnerSnapshot } from '../../domain/entities/partner.entity';

export interface CreatePartnerDto {
  name: string;
  webhookUrl: string;
  events: string[];
  description?: string;
  contactEmail?: string;
  createdBy?: string;
}

export interface UpdatePartnerDto {
  name?: string;
  webhookUrl?: string;
  events?: string[];
  description?: string;
  contactEmail?: string;
  status?: PartnerStatus;
}

@Injectable()
export class PartnerRepository {
  constructor(
    @InjectRepository(PartnerOrmEntity)
    private readonly repository: Repository<PartnerOrmEntity>,
  ) {}

  /**
   * Create a new partner
   */
  async create(dto: CreatePartnerDto): Promise<PartnerEntity> {
    const partner = PartnerEntity.create({
      name: dto.name,
      webhookUrl: dto.webhookUrl,
      events: dto.events,
    });

    const ormEntity = this.toOrmEntity(partner);
    ormEntity.description = dto.description;
    ormEntity.contactEmail = dto.contactEmail;
    ormEntity.createdBy = dto.createdBy;

    const saved = await this.repository.save(ormEntity);
    return this.toDomainEntity(saved);
  }

  /**
   * Find partner by ID
   */
  async findById(id: string): Promise<PartnerEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  /**
   * Find partner by name
   */
  async findByName(name: string): Promise<PartnerEntity | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  /**
   * Find all active partners
   */
  async findAllActive(): Promise<PartnerEntity[]> {
    const entities = await this.repository.find({
      where: { status: PartnerStatusORM.ACTIVE },
    });
    return entities.map((e) => this.toDomainEntity(e));
  }

  /**
   * Find all partners
   */
  async findAll(): Promise<PartnerEntity[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomainEntity(e));
  }

  /**
   * Find partners subscribed to event
   */
  async findByEventSubscription(eventType: string): Promise<PartnerEntity[]> {
    const activePartners = await this.findAllActive();
    return activePartners.filter(
      (p) => p.subscribesToEvent(eventType),
    );
  }

  /**
   * Update partner
   */
  async update(id: string, dto: UpdatePartnerDto): Promise<PartnerEntity | null> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) return null;

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.webhookUrl !== undefined) existing.webhookUrl = dto.webhookUrl;
    if (dto.events !== undefined) existing.events = dto.events;
    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.contactEmail !== undefined) existing.contactEmail = dto.contactEmail;
    if (dto.status !== undefined) existing.status = this.toOrmStatus(dto.status);

    const saved = await this.repository.save(existing);
    return this.toDomainEntity(saved);
  }

  /**
   * Regenerate partner secret
   */
  async regenerateSecret(id: string): Promise<{ partner: PartnerEntity; newSecret: string } | null> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) return null;

    const partner = this.toDomainEntity(existing);
    const newSecret = partner.regenerateSecret();

    existing.secret = partner.secret;
    const saved = await this.repository.save(existing);

    return {
      partner: this.toDomainEntity(saved),
      newSecret,
    };
  }

  /**
   * Record webhook delivery attempt
   */
  async recordWebhookAttempt(id: string, success: boolean): Promise<void> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) return;

    existing.lastWebhookAt = new Date();
    if (success) {
      existing.lastSuccessAt = new Date();
      existing.failedAttempts = 0;
    } else {
      existing.failedAttempts += 1;
      // Suspend after 10 consecutive failures
      if (existing.failedAttempts >= 10) {
        existing.status = PartnerStatusORM.SUSPENDED;
      }
    }

    await this.repository.save(existing);
  }

  /**
   * Delete partner
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if partner name exists
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }

  // Mapping helpers
  private toDomainEntity(orm: PartnerOrmEntity): PartnerEntity {
    const snapshot: PartnerSnapshot = {
      id: orm.id,
      name: orm.name,
      webhookUrl: orm.webhookUrl,
      secret: orm.secret,
      status: this.toDomainStatus(orm.status),
      events: orm.events,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    };
    return PartnerEntity.rehydrate(snapshot);
  }

  private toOrmEntity(domain: PartnerEntity): PartnerOrmEntity {
    const orm = new PartnerOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.webhookUrl = domain.webhookUrl;
    orm.secret = domain.secret;
    orm.status = this.toOrmStatus(domain.status);
    orm.events = domain.events;
    return orm;
  }

  private toDomainStatus(status: PartnerStatusORM): PartnerStatus {
    const map: Record<PartnerStatusORM, PartnerStatus> = {
      [PartnerStatusORM.ACTIVE]: 'ACTIVE',
      [PartnerStatusORM.INACTIVE]: 'INACTIVE',
      [PartnerStatusORM.SUSPENDED]: 'SUSPENDED',
    };
    return map[status];
  }

  private toOrmStatus(status: PartnerStatus): PartnerStatusORM {
    const map: Record<PartnerStatus, PartnerStatusORM> = {
      'ACTIVE': PartnerStatusORM.ACTIVE,
      'INACTIVE': PartnerStatusORM.INACTIVE,
      'SUSPENDED': PartnerStatusORM.SUSPENDED,
    };
    return map[status];
  }
}
