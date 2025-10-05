import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { User } from '../../auth/entities/user.entity.js';
import { RestaurantsController } from './interface/index.js';
import {
  RestaurantOrmEntity,
  RestaurantTypeOrmRepository,
  OwnerTypeOrmProvider,
} from './infrastructure/index.js';
import {
  CreateRestaurantUseCase,
  ListRestaurantsUseCase,
  ListOwnerRestaurantsUseCase,
  FindRestaurantUseCase,
  UpdateRestaurantUseCase,
  DeleteRestaurantUseCase,
  OWNER_READER,
  RESTAURANT_REPOSITORY,
} from './application/index.js';

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
