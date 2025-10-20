import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SubscriptionPlanService,
  SubscriptionService,
  SUBSCRIPTION_ORM_MAPPER,
  SUBSCRIPTION_PLAN_ORM_MAPPER,
  SubscriptionMapper,
  SubscriptionPlanMapper,
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
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants.js';
import type { ILoggerPort } from '@shared/application/ports/logger.port.js';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module.js';

@Module({
  imports: [
    LoggerModule,
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
    {
      provide: SubscriptionMapper,
      useFactory: () => new SubscriptionMapper(),
    },
    {
      provide: SubscriptionPlanMapper,
      useFactory: () => new SubscriptionPlanMapper(),
    },
    {
      provide: SubscriptionService,
      useFactory: (
        logger: ILoggerPort,
        subscriptionRepository: ISubscriptionRepositoryPort,
        subscriptionMapper: SubscriptionMapper,
      ) =>
        new SubscriptionService(
          logger,
          subscriptionRepository,
          subscriptionMapper,
        ),
      inject: [LOGGER, ISubscriptionRepositoryPort, SubscriptionMapper],
    },
    {
      provide: SubscriptionPlanService,
      useFactory: (
        logger: ILoggerPort,
        subscriptionPlanRepository: ISubscriptionPlanRepositoryPort,
        subscriptionPlanMapper: SubscriptionPlanMapper,
      ) =>
        new SubscriptionPlanService(
          logger,
          subscriptionPlanRepository,
          subscriptionPlanMapper,
        ),
      inject: [LOGGER, ISubscriptionPlanRepositoryPort, SubscriptionPlanMapper],
    },
  ],
  exports: [SubscriptionService, SubscriptionPlanService],
})
export class SubscriptionModule {}
