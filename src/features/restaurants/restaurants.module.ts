import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { ReservationModule } from '@features/reservation/reservation.module';
import {
  AdminRestaurantsController,
  RestaurantsController,
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
  ReassignRestaurantOwnerUseCase,
  FindRestaurantUseCase,
  FindRestaurantByNameUseCase,
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

/**
 * Restaurants module.
 *
 * Note: UserOrmEntity is NOT imported here because users live in Auth MS.
 * The ownerId is stored as a plain UUID reference and we trust the JWT token.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RestaurantOrmEntity,
      RestaurantScheduleExceptionOrmEntity,
      RestaurantScheduleSlotOrmEntity,
    ]),
    AuthModule,
    ReservationModule,
  ],
  controllers: [
    AdminRestaurantsController,
    RestaurantsController,
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
      provide: FindRestaurantByNameUseCase,
      useFactory: (restaurantRepository: RestaurantRepositoryPort) =>
        new FindRestaurantByNameUseCase(restaurantRepository),
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
      provide: ReassignRestaurantOwnerUseCase,
      useFactory: (restaurantDomainService: RestaurantDomainService) =>
        new ReassignRestaurantOwnerUseCase(restaurantDomainService),
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
        listNearbyRestaurantsUseCase: ListNearbyRestaurantsUseCase,
        updateRestaurantUseCase: UpdateRestaurantUseCase,
        updateRestaurantStatusUseCase: UpdateRestaurantStatusUseCase,
        deleteRestaurantUseCase: DeleteRestaurantUseCase,
        listRestaurantOwnersUseCase: ListRestaurantOwnersUseCase,
        reassignRestaurantOwnerUseCase: ReassignRestaurantOwnerUseCase,
        kafkaService: KafkaService,
      ) =>
        new RestaurantsService(
          createRestaurantUseCase,
          listRestaurantsUseCase,
          listOwnerRestaurantsUseCase,
          findRestaurantUseCase,
          listNearbyRestaurantsUseCase,
          updateRestaurantUseCase,
          updateRestaurantStatusUseCase,
          deleteRestaurantUseCase,
          listRestaurantOwnersUseCase,
          reassignRestaurantOwnerUseCase,
          kafkaService,
        ),
      inject: [
        CreateRestaurantUseCase,
        ListRestaurantsUseCase,
        ListOwnerRestaurantsUseCase,
        FindRestaurantUseCase,
        ListNearbyRestaurantsUseCase,
        UpdateRestaurantUseCase,
        UpdateRestaurantStatusUseCase,
        DeleteRestaurantUseCase,
        ListRestaurantOwnersUseCase,
        ReassignRestaurantOwnerUseCase,
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
    ReassignRestaurantOwnerUseCase,
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
