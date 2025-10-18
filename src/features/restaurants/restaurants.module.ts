import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module.js';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity.js';
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
  RestaurantsService,
  OWNER_READER,
  RESTAURANT_REPOSITORY,
} from './application/index.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantOrmEntity, UserOrmEntity]),
    AuthModule,
  ],
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
    RestaurantsService,
  ],
  exports: [
    CreateRestaurantUseCase,
    ListRestaurantsUseCase,
    ListOwnerRestaurantsUseCase,
    FindRestaurantUseCase,
    UpdateRestaurantUseCase,
    DeleteRestaurantUseCase,
    RestaurantsService,
  ],
})
export class RestaurantsModule {}
