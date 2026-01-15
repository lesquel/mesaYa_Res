/**
 * Partner TypeORM Repository
 *
 * Implementation of IPartnerRepositoryPort using TypeORM.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Partner,
  PartnerEventType,
  IPartnerRepositoryPort,
} from '../../domain';
import { PartnerOrmEntity } from './partner.orm-entity';
import { PartnerOrmMapper } from './partner.orm-mapper';

@Injectable()
export class PartnerTypeOrmRepository extends IPartnerRepositoryPort {
  constructor(
    @InjectRepository(PartnerOrmEntity)
    private readonly repository: Repository<PartnerOrmEntity>,
    private readonly mapper: PartnerOrmMapper,
  ) {
    super();
  }

  async save(partner: Partner): Promise<Partner> {
    const orm = this.mapper.toOrm(partner);
    const saved = await this.repository.save(orm);
    return this.mapper.toDomain(saved);
  }

  async findById(id: string): Promise<Partner | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByName(name: string): Promise<Partner | null> {
    const orm = await this.repository.findOne({ where: { name } });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findBySubscribedEvent(eventType: PartnerEventType): Promise<Partner[]> {
    // Use LIKE query for simple-array column
    const orms = await this.repository
      .createQueryBuilder('partner')
      .where('partner.subscribedEvents LIKE :event', { event: `%${eventType}%` })
      .andWhere('partner.status = :status', { status: 'active' })
      .getMany();

    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findAllActive(): Promise<Partner[]> {
    const orms = await this.repository.find({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findAll(): Promise<Partner[]> {
    const orms = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }
}
