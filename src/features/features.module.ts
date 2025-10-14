import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { SectionsModule } from './sections/sections.module';
import { AuthModule } from '../auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReservationModule } from './reservation/reservation.module.js';
import { TablesModule } from './tables/tables.module.js';
import { ObjectsModule } from './objects/objects.module.js';

@Module({
  imports: [
    RestaurantsModule,
    SectionsModule,
    AuthModule,
    ReviewsModule,
    ReservationModule,
    TablesModule,
    ObjectsModule,
  ],
  exports: [
    RestaurantsModule,
    SectionsModule,
    AuthModule,
    ReviewsModule,
    ReservationModule,
    TablesModule,
    ObjectsModule,
  ],
})
export class FeaturesModule {}
