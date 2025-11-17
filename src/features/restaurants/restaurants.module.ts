import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import {
  AdminRestaurantsController,
  PublicRestaurantsController,
  RestaurantRestaurantsController,
  RestaurantSchedulesController,
} from './interface/index';
import { RestaurantScheduleExceptionOrmEntity } from './infrastructure/database/typeorm/orm/restaurant-schedule-exception.orm-entity';
import { RestaurantScheduleSlotOrmEntity } from './infrastructure/database/typeorm/orm/restaurant-schedule-slot.orm-entity';
import { RestaurantScheduleExceptionRepository } from './infrastructure/database/typeorm/repositories/restaurant-schedule-exception.repository';
import { RestaurantScheduleSlotRepository } from './infrastructure/database/typeorm/repositories/restaurant-schedule-slot.repository';
import { RestaurantScheduleService } from './application/services/restaurant-schedule.service';
import {
  RestaurantOrmEntity,
  RestaurantTypeOrmRepository,
  OwnerTypeOrmProvider,
  RestaurantAnalyticsTypeOrmRepository,
} from './infrastructure/index';
import {
  CreateRestaurantUseCase,
  ListRestaurantsUseCase,
  ListNearbyRestaurantsUseCase,
  ListOwnerRestaurantsUseCase,
  ListRestaurantOwnersUseCase,
  FindRestaurantUseCase,
  UpdateRestaurantUseCase,
  UpdateRestaurantStatusUseCase,
  DeleteRestaurantUseCase,
  RestaurantsService,
  OWNER_READER,
  RESTAURANT_REPOSITORY,
  RESTAURANT_ANALYTICS_REPOSITORY,
  GetRestaurantAnalyticsUseCase,
} from './application/index';
import { RestaurantDomainService } from './domain/services/restaurant-domain.service';
import { IRestaurantDomainRepositoryPort } from './domain/repositories/restaurant-domain-repository.port';
import { IRestaurantOwnerPort } from './domain/ports/restaurant-owner.port';
import { KafkaService } from '@shared/infrastructure/kafka';
import type {
  RestaurantRepositoryPort,
  RestaurantAnalyticsRepositoryPort,
} from './application/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RestaurantOrmEntity,
      UserOrmEntity,
      RestaurantScheduleExceptionOrmEntity,
      RestaurantScheduleSlotOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [
    AdminRestaurantsController,
    PublicRestaurantsController,
    RestaurantRestaurantsController,
    RestaurantSchedulesController,
  ],
  providers: [
    RestaurantTypeOrmRepository,
    OwnerTypeOrmProvider,
    RestaurantAnalyticsTypeOrmRepository,
    RestaurantScheduleExceptionRepository,
    RestaurantScheduleSlotRepository,
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
      provide: ListNearbyRestaurantsUseCase,
      useFactory: (restaurantRepository: RestaurantRepositoryPort) =>
        new ListNearbyRestaurantsUseCase(restaurantRepository),
      inject: [RESTAURANT_REPOSITORY],
    },
    {
      provide: ListOwnerRestaurantsUseCase,
      useFactory: (restaurantRepository: RestaurantRepositoryPort) =>
        new ListOwnerRestaurantsUseCase(restaurantRepository),
      inject: [RESTAURANT_REPOSITORY],
    },
    {
      provide: ListRestaurantOwnersUseCase,
      useFactory: (restaurantRepository: RestaurantRepositoryPort) =>
        new ListRestaurantOwnersUseCase(restaurantRepository),
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
      provide: UpdateRestaurantStatusUseCase,
      useFactory: (restaurantDomainService: RestaurantDomainService) =>
        new UpdateRestaurantStatusUseCase(restaurantDomainService),
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
        updateRestaurantStatusUseCase: UpdateRestaurantStatusUseCase,
        deleteRestaurantUseCase: DeleteRestaurantUseCase,
        listRestaurantOwnersUseCase: ListRestaurantOwnersUseCase,
        listNearbyRestaurantsUseCase: ListNearbyRestaurantsUseCase,
        kafkaService: KafkaService,
      ) =>
        new RestaurantsService(
          createRestaurantUseCase,
          listRestaurantsUseCase,
          listOwnerRestaurantsUseCase,
          findRestaurantUseCase,
          updateRestaurantUseCase,
          updateRestaurantStatusUseCase,
          deleteRestaurantUseCase,
          listRestaurantOwnersUseCase,
          listNearbyRestaurantsUseCase,
          kafkaService,
        ),
      inject: [
        CreateRestaurantUseCase,
        ListRestaurantsUseCase,
        ListOwnerRestaurantsUseCase,
        FindRestaurantUseCase,
        UpdateRestaurantUseCase,
        UpdateRestaurantStatusUseCase,
        DeleteRestaurantUseCase,
        ListRestaurantOwnersUseCase,
        ListNearbyRestaurantsUseCase,
        KafkaService,
      ],
    },
    RestaurantScheduleService,
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
    ListRestaurantOwnersUseCase,
    ListNearbyRestaurantsUseCase,
    FindRestaurantUseCase,
    UpdateRestaurantUseCase,
    UpdateRestaurantStatusUseCase,
    DeleteRestaurantUseCase,
    RestaurantsService,
    GetRestaurantAnalyticsUseCase,
    RESTAURANT_REPOSITORY,
  ],
})
export class RestaurantsModule {}
