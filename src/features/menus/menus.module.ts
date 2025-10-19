import { Module } from '@nestjs/common';
import {
  DishService,
  MenuService,
  DishMapper,
  MenuMapper,
} from './application';
import {
  DishesController,
  MenusController,
} from './presentation/controllers/v1';

const menuMapperProvider = {
  provide: MenuMapper,
  useFactory: (dishMapper: DishMapper) => new MenuMapper(dishMapper),
  inject: [DishMapper],
};

@Module({
  controllers: [DishesController, MenusController],
  providers: [DishMapper, menuMapperProvider, DishService, MenuService],
  exports: [DishService, MenuService],
})
export class MenusModule {}
