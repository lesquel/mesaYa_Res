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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservationOrmEntity,
      RestaurantOrmEntity,
      UserOrmEntity,
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
    {
      provide: RESERVATION_EVENT_PUBLISHER,
      useClass: ReservationEventNoopProvider,
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
