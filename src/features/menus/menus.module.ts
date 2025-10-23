import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DishService,
  MenuService,
  DishMapper,
  MenuMapper,
  GetMenuAnalyticsUseCase,
  MENU_ANALYTICS_REPOSITORY,
} from './application/index';
import {
  DishesController,
  MenusController,
} from './presentation/controllers/v1/index';
import {
  DishOrmEntity,
  MenuOrmEntity,
  DishTypeOrmRepository,
  MenuTypeOrmRepository,
  MenuAnalyticsTypeOrmRepository,
} from './infrastructure/index';
import { IDishRepositoryPort, IMenuRepositoryPort } from './domain/index';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { KafkaService } from '@shared/infrastructure/kafka';

const menuMapperProvider = {
  provide: MenuMapper,
  useFactory: (dishMapper: DishMapper) => new MenuMapper(dishMapper),
  inject: [DishMapper],
};

const dishServiceProvider = {
  provide: DishService,
  useFactory: (
    logger: ILoggerPort,
    dishRepository: IDishRepositoryPort,
    dishMapper: DishMapper,
    kafkaService: KafkaService,
  ) => new DishService(logger, dishRepository, dishMapper, kafkaService),
  inject: [LOGGER, IDishRepositoryPort, DishMapper, KafkaService],
};

const menuServiceProvider = {
  provide: MenuService,
  useFactory: (
    logger: ILoggerPort,
    menuRepository: IMenuRepositoryPort,
    menuMapper: MenuMapper,
    kafkaService: KafkaService,
  ) => new MenuService(logger, menuRepository, menuMapper, kafkaService),
  inject: [LOGGER, IMenuRepositoryPort, MenuMapper, KafkaService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuOrmEntity, DishOrmEntity]),
    LoggerModule,
  ],
  controllers: [DishesController, MenusController],
  providers: [
    DishMapper,
    menuMapperProvider,
    dishServiceProvider,
    menuServiceProvider,
    {
      provide: IDishRepositoryPort,
      useClass: DishTypeOrmRepository,
    },
    {
      provide: IMenuRepositoryPort,
      useClass: MenuTypeOrmRepository,
    },
    {
      provide: MENU_ANALYTICS_REPOSITORY,
      useClass: MenuAnalyticsTypeOrmRepository,
    },
    GetMenuAnalyticsUseCase,
  ],
  exports: [DishService, MenuService, GetMenuAnalyticsUseCase],
})
export class MenusModule {}
