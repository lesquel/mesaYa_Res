import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module.js';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity.js';
import { ReservationsController } from './interface/index.js';
import {
  ReservationOrmEntity,
  ReservationTypeOrmRepository,
  RestaurantTypeOrmReservationProvider,
  UserTypeOrmReservationProvider,
} from './infrastructure/index.js';
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
} from './application/index.js';
import { RestaurantOrmEntity } from '../restaurants/index.js';
import { ReservationService } from './application/index.js';
import { ReservationEventNoopProvider } from './infrastructure/index.js';

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
