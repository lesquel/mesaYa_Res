import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DishService,
  MenuService,
  DishMapper,
  MenuMapper,
  GetMenuAnalyticsUseCase,
  MENU_ANALYTICS_REPOSITORY,
  GetDishAnalyticsUseCase,
  DISH_ANALYTICS_REPOSITORY,
} from './application';
import {
  DishesController,
  MenusController,
  PublicDishesController,
  PublicMenusController,
} from './presentation/controllers/v1';
import {
  DishOrmEntity,
  MenuOrmEntity,
  DishTypeOrmRepository,
  MenuTypeOrmRepository,
  MenuAnalyticsTypeOrmRepository,
  DishAnalyticsTypeOrmRepository,
} from './infrastructure';
import { IDishRepositoryPort, IMenuRepositoryPort } from './domain';
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
  controllers: [
    DishesController,
    MenusController,
    PublicDishesController,
    PublicMenusController,
  ],
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
    {
      provide: DISH_ANALYTICS_REPOSITORY,
      useClass: DishAnalyticsTypeOrmRepository,
    },
    GetMenuAnalyticsUseCase,
    GetDishAnalyticsUseCase,
  ],
  exports: [
    DishService,
    MenuService,
    GetMenuAnalyticsUseCase,
    GetDishAnalyticsUseCase,
    IDishRepositoryPort,
    IMenuRepositoryPort,
  ],
})
export class MenusModule {}
