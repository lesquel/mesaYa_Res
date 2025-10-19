import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SubscriptionPlanService,
  SubscriptionService,
  SUBSCRIPTION_ORM_MAPPER,
  SUBSCRIPTION_PLAN_ORM_MAPPER,
} from './application/index.js';
import {
  SubscriptionPlanOrmMapper,
  SubscriptionOrmMapper,
  SubscriptionPlanTypeOrmRepository,
  SubscriptionTypeOrmRepository,
  SubscriptionPlanOrmEntity,
  SubscriptionOrmEntity,
} from './infrastructure/index.js';
import {
  SubscriptionPlanController,
  SubscriptionController,
} from './presentation/index.js';
import {
  ISubscriptionPlanRepositoryPort,
  ISubscriptionRepositoryPort,
} from './domain/index.js';
import { RestaurantOrmEntity } from '@features/restaurants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionOrmEntity,
      SubscriptionPlanOrmEntity,
      RestaurantOrmEntity,
    ]),
  ],
  controllers: [SubscriptionController, SubscriptionPlanController],
  providers: [
    {
      provide: SUBSCRIPTION_ORM_MAPPER,
      useClass: SubscriptionOrmMapper,
    },
    {
      provide: SUBSCRIPTION_PLAN_ORM_MAPPER,
      useClass: SubscriptionPlanOrmMapper,
    },
    {
      provide: ISubscriptionRepositoryPort,
      useClass: SubscriptionTypeOrmRepository,
    },
    {
      provide: ISubscriptionPlanRepositoryPort,
      useClass: SubscriptionPlanTypeOrmRepository,
    },
    SubscriptionService,
    SubscriptionPlanService,
  ],
  exports: [SubscriptionService, SubscriptionPlanService],
})
export class SubscriptionModule {}
