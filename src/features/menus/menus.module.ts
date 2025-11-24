import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantOrmEntity } from '../restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import {
  DishService,
  MenuService,
  MenuCategoryService,
  DishMapper,
  MenuMapper,
  MenuCategoryMapper,
  GetMenuAnalyticsUseCase,
  MENU_ANALYTICS_REPOSITORY,
  GetDishAnalyticsUseCase,
  DISH_ANALYTICS_REPOSITORY,
  MenusAccessService,
} from './application';
import {
  DishesController,
  MenusController,
  MenuCategoriesController,
} from './presentation/controllers/v1';
import {
  DishOrmEntity,
  MenuOrmEntity,
  MenuCategoryOrmEntity,
  DishTypeOrmRepository,
  MenuTypeOrmRepository,
  MenuCategoryTypeOrmRepository,
  MenuAnalyticsTypeOrmRepository,
  DishAnalyticsTypeOrmRepository,
} from './infrastructure';
import {
  IDishRepositoryPort,
  IMenuRepositoryPort,
  IMenuCategoryRepositoryPort,
} from './domain';
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
    TypeOrmModule.forFeature([
      MenuOrmEntity,
      DishOrmEntity,
      MenuCategoryOrmEntity,
      RestaurantOrmEntity,
    ]),
    LoggerModule,
  ],
  controllers: [MenusController, DishesController, MenuCategoriesController],
  providers: [
    DishMapper,
    menuMapperProvider,
    dishServiceProvider,
    menuServiceProvider,
    {
      provide: IMenuCategoryRepositoryPort,
      useClass: MenuCategoryTypeOrmRepository,
    },
    {
      provide: MenuCategoryMapper,
      useFactory: () => new MenuCategoryMapper(),
      inject: [],
    },
    {
      provide: MenuCategoryService,
      useFactory: (
        logger: ILoggerPort,
        repository: IMenuCategoryRepositoryPort,
        mapper: MenuCategoryMapper,
      ) => new MenuCategoryService(logger, repository, mapper),
      inject: [LOGGER, IMenuCategoryRepositoryPort, MenuCategoryMapper],
    },
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
    MenusAccessService,
  ],
  exports: [
    DishService,
    MenuService,
    MenuCategoryService,
    GetMenuAnalyticsUseCase,
    GetDishAnalyticsUseCase,
    IDishRepositoryPort,
    IMenuRepositoryPort,
    IMenuCategoryRepositoryPort,
    MenusAccessService,
  ],
})
export class MenusModule {}
