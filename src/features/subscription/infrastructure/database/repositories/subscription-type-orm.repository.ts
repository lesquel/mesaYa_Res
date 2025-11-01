import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  SubscriptionNotFoundError,
  SubscriptionPlanInactiveError,
  SubscriptionPlanNotFoundError,
  SubscriptionRestaurantNotFoundError,
} from '../../../domain/errors';
import { SubscriptionEntity } from '../../../domain/entities/subscription.entity';
import { SubscriptionPlanStatesEnum } from '../../../domain/enums';
import { SubscriptionOrmEntity } from '../orm/subscription.type-orm.entity';
import { SubscriptionPlanOrmEntity } from '../orm/subscription-plan.type-orm.entity';
import { RestaurantOrmEntity } from '@features/restaurants';
import { ISubscriptionRepositoryPort } from '@features/subscription/domain/repositories';
import {
  SubscriptionCreate,
  SubscriptionUpdate,
} from '@features/subscription/domain';
import {
  SUBSCRIPTION_ORM_MAPPER,
  SubscriptionOrmMapperPort,
} from '@features/subscription/application';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListSubscriptionsQuery } from '@features/subscription/application/dtos/input/list-subscriptions.query';

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
      relations: ['subscriptionPlan', 'restaurant'],
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
      relations: ['subscriptionPlan', 'restaurant'],
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    const entities = await this.subscriptions.find({
      relations: ['subscriptionPlan', 'restaurant'],
    });

    return this.mapper.toDomainList(entities);
  }

  async findByRestaurantId(
    restaurantId: string,
  ): Promise<SubscriptionEntity | null> {
    const entity = await this.subscriptions
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.subscriptionPlan', 'subscriptionPlan')
      .leftJoinAndSelect('subscription.restaurant', 'restaurant')
      .where('subscription.restaurantId = :restaurantId', { restaurantId })
      .orderBy('subscription.subscriptionStartDate', 'DESC')
      .getOne();

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async paginate(
    query: ListSubscriptionsQuery,
  ): Promise<PaginatedResult<SubscriptionEntity>> {
    const qb = this.buildBaseQuery();
    return this.executePagination(qb, query);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.subscriptions.delete({ id });
    if (!result.affected) {
      throw new SubscriptionNotFoundError(id);
    }
    return true;
  }

  private buildBaseQuery(): SelectQueryBuilder<SubscriptionOrmEntity> {
    const alias = 'subscription';
    return this.subscriptions
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.subscriptionPlan`, 'subscriptionPlan')
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<SubscriptionOrmEntity>,
    query: ListSubscriptionsQuery,
  ): Promise<PaginatedResult<SubscriptionEntity>> {
    const alias = qb.alias;

    const sortMap: Record<string, string> = {
      subscriptionStartDate: `${alias}.subscriptionStartDate`,
      stateSubscription: `${alias}.stateSubscription`,
      restaurant: `restaurant.name`,
      plan: `subscriptionPlan.name`,
      createdAt: `${alias}.createdAt`,
    };

    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search,
      allowedSorts: Object.values(sortMap),
      searchable: [
        `${alias}.stateSubscription`,
        `restaurant.name`,
        `subscriptionPlan.name`,
      ],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        this.mapper.toDomain(entity),
      ),
    };
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
