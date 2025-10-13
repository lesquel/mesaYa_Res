import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { SectionsModule } from './sections/sections.module';
import { AuthModule } from '../auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BookingModule } from './booking/booking.module.js';
import { TablesModule } from './tables/tables.module.js';

@Module({
  imports: [RestaurantsModule, SectionsModule, AuthModule, ReviewsModule, BookingModule, TablesModule],
  exports: [RestaurantsModule, SectionsModule, AuthModule, ReviewsModule, BookingModule, TablesModule],
})
export class FeaturesModule {}
