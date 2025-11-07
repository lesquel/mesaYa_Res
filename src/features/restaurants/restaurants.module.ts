import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import {
  AdminRestaurantsController,
  PublicRestaurantsController,
} from './interface/index.js';
import {
  RestaurantOrmEntity,
  RestaurantTypeOrmRepository,
  OwnerTypeOrmProvider,
  RestaurantAnalyticsTypeOrmRepository,
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
  RESTAURANT_ANALYTICS_REPOSITORY,
  GetRestaurantAnalyticsUseCase,
} from './application/index.js';
import { RestaurantDomainService } from './domain/services/restaurant-domain.service.js';
import { IRestaurantDomainRepositoryPort } from './domain/repositories/restaurant-domain-repository.port.js';
import { IRestaurantOwnerPort } from './domain/ports/restaurant-owner.port.js';
import { KafkaService } from '@shared/infrastructure/kafka';
import type {
  RestaurantRepositoryPort,
  RestaurantAnalyticsRepositoryPort,
} from './application/index.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantOrmEntity, UserOrmEntity]),
    AuthModule,
  ],
  controllers: [AdminRestaurantsController, PublicRestaurantsController],
  providers: [
    RestaurantTypeOrmRepository,
    OwnerTypeOrmProvider,
    RestaurantAnalyticsTypeOrmRepository,
    {
      provide: RESTAURANT_REPOSITORY,
      useExisting: RestaurantTypeOrmRepository,
    },
    {
      provide: OWNER_READER,
      useExisting: OwnerTypeOrmProvider,
    },
    {
      provide: RESTAURANT_ANALYTICS_REPOSITORY,
      useExisting: RestaurantAnalyticsTypeOrmRepository,
    },
    {
      provide: IRestaurantDomainRepositoryPort,
      useExisting: RestaurantTypeOrmRepository,
    },
    {
      provide: IRestaurantOwnerPort,
      useExisting: OwnerTypeOrmProvider,
    },
    {
      provide: RestaurantDomainService,
      useFactory: (
        restaurantRepository: IRestaurantDomainRepositoryPort,
        ownerPort: IRestaurantOwnerPort,
      ) => new RestaurantDomainService(restaurantRepository, ownerPort),
      inject: [IRestaurantDomainRepositoryPort, IRestaurantOwnerPort],
    },
    {
      provide: CreateRestaurantUseCase,
      useFactory: (restaurantDomainService: RestaurantDomainService) =>
        new CreateRestaurantUseCase(restaurantDomainService),
      inject: [RestaurantDomainService],
    },
    {
      provide: ListRestaurantsUseCase,
      useFactory: (restaurantRepository: RestaurantRepositoryPort) =>
        new ListRestaurantsUseCase(restaurantRepository),
      inject: [RESTAURANT_REPOSITORY],
    },
    {
      provide: ListOwnerRestaurantsUseCase,
      useFactory: (restaurantRepository: RestaurantRepositoryPort) =>
        new ListOwnerRestaurantsUseCase(restaurantRepository),
      inject: [RESTAURANT_REPOSITORY],
    },
    {
      provide: FindRestaurantUseCase,
      useFactory: (restaurantRepository: RestaurantRepositoryPort) =>
        new FindRestaurantUseCase(restaurantRepository),
      inject: [RESTAURANT_REPOSITORY],
    },
    {
      provide: UpdateRestaurantUseCase,
      useFactory: (restaurantDomainService: RestaurantDomainService) =>
        new UpdateRestaurantUseCase(restaurantDomainService),
      inject: [RestaurantDomainService],
    },
    {
      provide: DeleteRestaurantUseCase,
      useFactory: (restaurantDomainService: RestaurantDomainService) =>
        new DeleteRestaurantUseCase(restaurantDomainService),
      inject: [RestaurantDomainService],
    },
    {
      provide: RestaurantsService,
      useFactory: (
        createRestaurantUseCase: CreateRestaurantUseCase,
        listRestaurantsUseCase: ListRestaurantsUseCase,
        listOwnerRestaurantsUseCase: ListOwnerRestaurantsUseCase,
        findRestaurantUseCase: FindRestaurantUseCase,
        updateRestaurantUseCase: UpdateRestaurantUseCase,
        deleteRestaurantUseCase: DeleteRestaurantUseCase,
        kafkaService: KafkaService,
      ) =>
        new RestaurantsService(
          createRestaurantUseCase,
          listRestaurantsUseCase,
          listOwnerRestaurantsUseCase,
          findRestaurantUseCase,
          updateRestaurantUseCase,
          deleteRestaurantUseCase,
          kafkaService,
        ),
      inject: [
        CreateRestaurantUseCase,
        ListRestaurantsUseCase,
        ListOwnerRestaurantsUseCase,
        FindRestaurantUseCase,
        UpdateRestaurantUseCase,
        DeleteRestaurantUseCase,
        KafkaService,
      ],
    },
    {
      provide: GetRestaurantAnalyticsUseCase,
      useFactory: (analyticsRepository: RestaurantAnalyticsRepositoryPort) =>
        new GetRestaurantAnalyticsUseCase(analyticsRepository),
      inject: [RESTAURANT_ANALYTICS_REPOSITORY],
    },
  ],
  exports: [
    CreateRestaurantUseCase,
    ListRestaurantsUseCase,
    ListOwnerRestaurantsUseCase,
    FindRestaurantUseCase,
    UpdateRestaurantUseCase,
    DeleteRestaurantUseCase,
    RestaurantsService,
    GetRestaurantAnalyticsUseCase,
    RESTAURANT_REPOSITORY,
  ],
})
export class RestaurantsModule {}
