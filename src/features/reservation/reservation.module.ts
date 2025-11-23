import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import { ReservationsController } from './interface';
import {
  ReservationOrmEntity,
  ReservationTypeOrmRepository,
  RestaurantTypeOrmReservationProvider,
  UserTypeOrmReservationProvider,
  TableTypeOrmReservationProvider,
  ReservationAnalyticsTypeOrmRepository,
} from './infrastructure';
import {
  CreateReservationUseCase,
  ListReservationsUseCase,
  ListRestaurantReservationsUseCase,
  ListOwnerReservationsUseCase,
  FindReservationUseCase,
  UpdateReservationUseCase,
  DeleteReservatioUseCase,
  UpdateOwnerReservationUseCase,
  DeleteOwnerReservationUseCase,
  RESERVATION_REPOSITORY,
  RESTAURANT_RESERVATION_READER,
  USER_RESERVATION_READER,
  RESERVATION_EVENT_PUBLISHER,
  RESERVATION_ANALYTICS_REPOSITORY,
  GetReservationAnalyticsUseCase,
  ReservationOwnerAccessService,
} from './application';
import { RestaurantOrmEntity } from '../restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import { ReservationService } from './application';
import { ReservationEventNoopProvider } from './infrastructure';
import {
  ReservationDomainService,
  IReservationRepositoryPort,
  IReservationRestaurantPort,
  IReservationUserPort,
  IReservationTablePort,
} from './domain';
import { TableOrmEntity } from '../tables/infrastructure/database/typeorm/orm/table.orm-entity';
import { SectionOrmEntity } from '../sections/infrastructure/database/typeorm/orm/section.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservationOrmEntity,
      RestaurantOrmEntity,
      UserOrmEntity,
      TableOrmEntity,
      SectionOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationTypeOrmRepository,
    ReservationAnalyticsTypeOrmRepository,
    RestaurantTypeOrmReservationProvider,
    UserTypeOrmReservationProvider,
    TableTypeOrmReservationProvider,
    ReservationEventNoopProvider,
    ReservationOwnerAccessService,
    {
      provide: RESERVATION_REPOSITORY,
      useExisting: ReservationTypeOrmRepository,
    },
    {
      provide: RESTAURANT_RESERVATION_READER,
      useExisting: RestaurantTypeOrmReservationProvider,
    },
    {
      provide: USER_RESERVATION_READER,
      useExisting: UserTypeOrmReservationProvider,
    },
    {
      provide: RESERVATION_EVENT_PUBLISHER,
      useExisting: ReservationEventNoopProvider,
    },
    {
      provide: RESERVATION_ANALYTICS_REPOSITORY,
      useExisting: ReservationAnalyticsTypeOrmRepository,
    },
    {
      provide: IReservationRepositoryPort,
      useExisting: ReservationTypeOrmRepository,
    },
    {
      provide: IReservationRestaurantPort,
      useExisting: RestaurantTypeOrmReservationProvider,
    },
    {
      provide: IReservationUserPort,
      useExisting: UserTypeOrmReservationProvider,
    },
    {
      provide: IReservationTablePort,
      useExisting: TableTypeOrmReservationProvider,
    },
    {
      provide: ReservationDomainService,
      useFactory: (
        reservationRepository: IReservationRepositoryPort,
        restaurantPort: IReservationRestaurantPort,
        tablePort: IReservationTablePort,
        userPort: IReservationUserPort,
      ) =>
        new ReservationDomainService(
          reservationRepository,
          restaurantPort,
          tablePort,
          userPort,
        ),
      inject: [
        IReservationRepositoryPort,
        IReservationRestaurantPort,
        IReservationTablePort,
        IReservationUserPort,
      ],
    },
    ReservationService,
    CreateReservationUseCase,
    ListReservationsUseCase,
    ListRestaurantReservationsUseCase,
    ListOwnerReservationsUseCase,
    FindReservationUseCase,
    UpdateReservationUseCase,
    DeleteReservatioUseCase,
    UpdateOwnerReservationUseCase,
    DeleteOwnerReservationUseCase,
    GetReservationAnalyticsUseCase,
  ],
  exports: [
    CreateReservationUseCase,
    ListReservationsUseCase,
    ListRestaurantReservationsUseCase,
    ListOwnerReservationsUseCase,
    FindReservationUseCase,
    UpdateReservationUseCase,
    DeleteReservatioUseCase,
    UpdateOwnerReservationUseCase,
    DeleteOwnerReservationUseCase,
    GetReservationAnalyticsUseCase,
    RESERVATION_REPOSITORY,
    IReservationRepositoryPort,
  ],
})
export class ReservationModule {}
