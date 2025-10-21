import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import { ReservationsController } from './interface/index';
import {
  ReservationOrmEntity,
  ReservationTypeOrmRepository,
  RestaurantTypeOrmReservationProvider,
  UserTypeOrmReservationProvider,
  TableTypeOrmReservationProvider,
} from './infrastructure/index';
import {
  CreateReservationUseCase,
  ListReservationsUseCase,
  ListRestaurantReservationsUseCase,
  FindReservationUseCase,
  UpdateReservationUseCase,
  DeleteReservatioUseCase,
  RESERVATION_REPOSITORY,
  RESTAURANT_RESERVATION_READER,
  USER_RESERVATION_READER,
  RESERVATION_EVENT_PUBLISHER,
} from './application/index';
import { RestaurantOrmEntity } from '../restaurants/index';
import { ReservationService } from './application/index';
import { ReservationEventNoopProvider } from './infrastructure/index';
import {
  ReservationDomainService,
  IReservationRepositoryPort,
  IReservationRestaurantPort,
  IReservationUserPort,
  IReservationTablePort,
} from './domain/index';
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
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationTypeOrmRepository,
    },
    {
      provide: RESTAURANT_RESERVATION_READER,
      useClass: RestaurantTypeOrmReservationProvider,
    },
    {
      provide: USER_RESERVATION_READER,
      useClass: UserTypeOrmReservationProvider,
    },
    TableTypeOrmReservationProvider,
    {
      provide: RESERVATION_EVENT_PUBLISHER,
      useClass: ReservationEventNoopProvider,
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
    FindReservationUseCase,
    UpdateReservationUseCase,
    DeleteReservatioUseCase,
  ],
  exports: [
    CreateReservationUseCase,
    ListReservationsUseCase,
    ListRestaurantReservationsUseCase,
    FindReservationUseCase,
    UpdateReservationUseCase,
    DeleteReservatioUseCase,
  ],
})
export class ReservationModule {}
