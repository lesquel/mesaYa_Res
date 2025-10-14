import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { UserOrmEntity } from '../../auth/entities/user.entity.js';
import { ReservationsController } from './interface/index.js';
import {
  ReservationOrmEntity,
  ReservationTypeOrmRepository,
  RestaurantTypeOrmBookingProvider,
  UserTypeOrmBookingProvider,
} from './infrastructure/index.js';
import {
  CreateReservationUseCase,
  ListReservationsUseCase,
  ListRestaurantReservationsUseCase,
  FindReservationUseCase,
  UpdateReservationUseCase,
  DeleteReservatioUseCase,
  RESERVATION_REPOSITORY,
  RESTAURANT_BOOKING_READER,
  USER_BOOKING_READER,
  BOOKING_EVENT_PUBLISHER,
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
      provide: RESTAURANT_BOOKING_READER,
      useClass: RestaurantTypeOrmBookingProvider,
    },
    {
      provide: USER_BOOKING_READER,
      useClass: UserTypeOrmBookingProvider,
    },
    {
      provide: BOOKING_EVENT_PUBLISHER,
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
