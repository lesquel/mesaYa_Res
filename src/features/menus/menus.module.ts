import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DishService,
  MenuService,
  DishMapper,
  MenuMapper,
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
} from './infrastructure/index';
import { IDishRepositoryPort, IMenuRepositoryPort } from './domain/index';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';

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
  ) => new DishService(logger, dishRepository, dishMapper),
  inject: [LOGGER, IDishRepositoryPort, DishMapper],
};

const menuServiceProvider = {
  provide: MenuService,
  useFactory: (
    logger: ILoggerPort,
    menuRepository: IMenuRepositoryPort,
    menuMapper: MenuMapper,
  ) => new MenuService(logger, menuRepository, menuMapper),
  inject: [LOGGER, IMenuRepositoryPort, MenuMapper],
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
  ],
  exports: [DishService, MenuService],
})
export class MenusModule {}
