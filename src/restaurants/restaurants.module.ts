import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './interface/controllers/restaurants.controller.js';
import { RestaurantOrmEntity } from './infrastructure/orm/restaurant.orm-entity.js';
import { RestaurantTypeOrmRepository } from './infrastructure/repositories/restaurant-typeorm.repository.js';
import { OwnerTypeOrmProvider } from './infrastructure/providers/owner-typeorm.provider.js';
import { AuthModule } from '../auth/auth.module.js';
import { User } from '../auth/entities/user.entity.js';
import { CreateRestaurantUseCase } from './application/use-cases/create-restaurant.use-case.js';
import { ListRestaurantsUseCase } from './application/use-cases/list-restaurants.use-case.js';
import { ListOwnerRestaurantsUseCase } from './application/use-cases/list-owner-restaurants.use-case.js';
import { FindRestaurantUseCase } from './application/use-cases/find-restaurant.use-case.js';
import { UpdateRestaurantUseCase } from './application/use-cases/update-restaurant.use-case.js';
import { DeleteRestaurantUseCase } from './application/use-cases/delete-restaurant.use-case.js';
import { OWNER_READER } from './application/ports/owner-reader.port.js';
import { RESTAURANT_REPOSITORY } from './application/ports/restaurant-repository.port.js';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantOrmEntity, User]), AuthModule],
  controllers: [RestaurantsController],
  providers: [
    {
      provide: RESTAURANT_REPOSITORY,
      useClass: RestaurantTypeOrmRepository,
    },
    {
      provide: OWNER_READER,
      useClass: OwnerTypeOrmProvider,
    },
    CreateRestaurantUseCase,
    ListRestaurantsUseCase,
    ListOwnerRestaurantsUseCase,
    FindRestaurantUseCase,
    UpdateRestaurantUseCase,
    DeleteRestaurantUseCase,
  ],
  exports: [
    CreateRestaurantUseCase,
    ListRestaurantsUseCase,
    ListOwnerRestaurantsUseCase,
    FindRestaurantUseCase,
    UpdateRestaurantUseCase,
    DeleteRestaurantUseCase,
  ],
})
export class RestaurantsModule {}
