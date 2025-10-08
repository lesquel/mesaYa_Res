import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { User } from '../../auth/entities/user.entity.js';
import { BookingsController } from './interface/index.js';
import {
	BookingOrmEntity,
	BookingTypeOrmRepository,
	RestaurantTypeOrmBookingProvider,
	UserTypeOrmBookingProvider,
} from './infrastructure/index.js';
import {
	CreateBookingUseCase,
	ListBookingsUseCase,
	ListRestaurantBookingsUseCase,
	FindBookingUseCase,
	UpdateBookingUseCase,
	DeleteBookingUseCase,
	BOOKING_REPOSITORY,
	RESTAURANT_BOOKING_READER,
	USER_BOOKING_READER,
} from './application/index.js';
import { RestaurantOrmEntity } from '../restaurants/index.js';

@Module({
	imports: [
		TypeOrmModule.forFeature([BookingOrmEntity, RestaurantOrmEntity, User]),
		AuthModule,
	],
	controllers: [BookingsController],
	providers: [
		{
			provide: BOOKING_REPOSITORY,
			useClass: BookingTypeOrmRepository,
		},
		{
			provide: RESTAURANT_BOOKING_READER,
			useClass: RestaurantTypeOrmBookingProvider,
		},
		{
			provide: USER_BOOKING_READER,
			useClass: UserTypeOrmBookingProvider,
		},
		CreateBookingUseCase,
		ListBookingsUseCase,
		ListRestaurantBookingsUseCase,
		FindBookingUseCase,
		UpdateBookingUseCase,
		DeleteBookingUseCase,
	],
	exports: [
		CreateBookingUseCase,
		ListBookingsUseCase,
		ListRestaurantBookingsUseCase,
		FindBookingUseCase,
		UpdateBookingUseCase,
		DeleteBookingUseCase,
	],
})
export class BookingModule {}
