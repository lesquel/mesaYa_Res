import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubscriptionNotFoundError,
  SubscriptionPlanInactiveError,
  SubscriptionPlanNotFoundError,
  SubscriptionRestaurantNotFoundError,
} from '../../../domain/errors/index.js';
import { SubscriptionEntity } from '../../../domain/entities/subscription.entity.js';
import { SubscriptionPlanStatesEnum } from '../../../domain/enums';
import { SubscriptionOrmEntity } from '../orm/subscription.type-orm.entity';
import { SubscriptionPlanOrmEntity } from '../orm/subscription-plan.type-orm.entity';
import { RestaurantOrmEntity } from '@features/restaurants';
import { ISubscriptionRepositoryPort } from '@features/subscription/domain/repositories/index.js';
import {
  SubscriptionCreate,
  SubscriptionUpdate,
} from '@features/subscription/domain/index.js';
import {
  SUBSCRIPTION_ORM_MAPPER,
  SubscriptionOrmMapperPort,
} from '@features/subscription/application';

@Injectable()
export class SubscriptionTypeOrmRepository extends ISubscriptionRepositoryPort {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptions: Repository<SubscriptionOrmEntity>,
    @InjectRepository(SubscriptionPlanOrmEntity)
    private readonly plans: Repository<SubscriptionPlanOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
    @Inject(SUBSCRIPTION_ORM_MAPPER)
    private readonly mapper: SubscriptionOrmMapperPort<SubscriptionOrmEntity>,
  ) {
    super();
  }

  async create(data: SubscriptionCreate): Promise<SubscriptionEntity> {
    const plan = await this.ensurePlanIsUsable(data.subscriptionPlanId);
    const restaurant = await this.ensureRestaurantExists(data.restaurantId);

    const entity = this.subscriptions.create({
      subscriptionPlanId: data.subscriptionPlanId,
      restaurantId: data.restaurantId,
      subscriptionStartDate: data.subscriptionStartDate,
      stateSubscription: data.stateSubscription.value,
      subscriptionPlan: plan,
      restaurant,
    });

    const saved = await this.subscriptions.save(entity);
    return this.mapper.toDomain(saved);
  }

  async update(data: SubscriptionUpdate): Promise<SubscriptionEntity | null> {
    const entity = await this.subscriptions.findOne({
      where: { id: data.subscriptionId },
      relations: ['plan', 'restaurant'],
    });

    if (!entity) {
      return null;
    }

    if (
      data.subscriptionPlanId &&
      data.subscriptionPlanId !== entity.subscriptionPlan.id
    ) {
      entity.subscriptionPlan = await this.ensurePlanIsUsable(
        data.subscriptionPlanId,
      );
      entity.subscriptionPlanId = data.subscriptionPlanId;
    }

    if (data.restaurantId && data.restaurantId !== entity.restaurant.id) {
      entity.restaurant = await this.ensureRestaurantExists(data.restaurantId);
      entity.restaurantId = data.restaurantId;
    }

    if (data.subscriptionStartDate) {
      entity.subscriptionStartDate = data.subscriptionStartDate;
    }

    if (data.stateSubscription) {
      entity.stateSubscription = data.stateSubscription.value;
    }

    const saved = await this.subscriptions.save(entity);
    return this.mapper.toDomain(saved);
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const entity = await this.subscriptions.findOne({
      where: { id },
      relations: ['plan', 'restaurant'],
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    const entities = await this.subscriptions.find({
      relations: ['plan', 'restaurant'],
    });

    return this.mapper.toDomainList(entities);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.subscriptions.delete({ id });
    if (!result.affected) {
      throw new SubscriptionNotFoundError(id);
    }
    return true;
  }

  private async ensurePlanIsUsable(
    subscriptionPlanId: string,
  ): Promise<SubscriptionPlanOrmEntity> {
    const plan = await this.plans.findOne({
      where: { id: subscriptionPlanId },
    });

    if (!plan) {
      throw new SubscriptionPlanNotFoundError(subscriptionPlanId);
    }

    if (plan.stateSubscriptionPlan !== SubscriptionPlanStatesEnum.ACTIVE) {
      throw new SubscriptionPlanInactiveError(subscriptionPlanId);
    }

    return plan;
  }

  private async ensureRestaurantExists(
    restaurantId: string,
  ): Promise<RestaurantOrmEntity> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new SubscriptionRestaurantNotFoundError(restaurantId);
    }

    return restaurant;
  }
}
