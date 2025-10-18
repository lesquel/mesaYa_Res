import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlanOrmEntity } from '../orm/subscription-plan.type-orm.entity';
import { SubscriptionPlanOrmMapper } from '../mappers/subscription-plan.orm-mapper';
import { SubscriptionPlanEntity } from '../../../domain/entities/subscription-plan.entity.js';
import { ISubscriptionPlanRepositoryPort } from '@features/subscription/domain/repositories';
import { SubscriptionPlanNotFoundError } from '../../../domain/errors/subscription-plan-not-found.error';
import {
  SubscriptionPlanCreate,
  SubscriptionPlanUpdate,
} from '@features/subscription/domain';

@Injectable()
export class SubscriptionPlanTypeOrmRepository extends ISubscriptionPlanRepositoryPort {
  constructor(
    @InjectRepository(SubscriptionPlanOrmEntity)
    private readonly plans: Repository<SubscriptionPlanOrmEntity>,
  ) {
    super();
  }

  async create(data: SubscriptionPlanCreate): Promise<SubscriptionPlanEntity> {
    const entity = this.plans.create({
      name: data.name,
      price: data.price.amount,
      subscriptionPeriod: data.subscriptionPeriod.value,
      stateSubscriptionPlan: data.stateSubscriptionPlan.value,
    });

    const saved = await this.plans.save(entity);
    return SubscriptionPlanOrmMapper.toDomain(saved);
  }

  async update(
    data: SubscriptionPlanUpdate,
  ): Promise<SubscriptionPlanEntity | null> {
    const entity = await this.plans.findOne({
      where: { id: data.subscriptionPlanId },
    });

    if (!entity) {
      return null;
    }

    if (data.name) {
      entity.name = data.name;
    }

    if (data.price) {
      entity.price = data.price.amount;
    }

    if (data.subscriptionPeriod) {
      entity.subscriptionPeriod = data.subscriptionPeriod.value;
    }

    if (data.stateSubscriptionPlan) {
      entity.stateSubscriptionPlan = data.stateSubscriptionPlan.value;
    }

    const saved = await this.plans.save(entity);
    return SubscriptionPlanOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<SubscriptionPlanEntity | null> {
    const entity = await this.plans.findOne({ where: { id } });
    return entity ? SubscriptionPlanOrmMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<SubscriptionPlanEntity[]> {
    const entities = await this.plans.find();
    return entities.map((entity) => SubscriptionPlanOrmMapper.toDomain(entity));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.plans.delete({ id });
    if (!result.affected) {
      throw new SubscriptionPlanNotFoundError(id);
    }
    return true;
  }
}
