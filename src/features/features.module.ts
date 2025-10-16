import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module.js';
import { SectionsModule } from './sections/sections.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { ReservationModule } from './reservation/reservation.module.js';
import { TablesModule } from './tables/tables.module.js';
import { ObjectsModule } from './objects/objects.module.js';
import { SectionObjectsModule } from './section-objects/section-objects.module.js';

@Module({
  imports: [
    RestaurantsModule,
    SectionsModule,
    AuthModule,
    ReviewsModule,
    ReservationModule,
    TablesModule,
    ObjectsModule,
    SectionObjectsModule,
  ],
  exports: [
    RestaurantsModule,
    SectionsModule,
    AuthModule,
    ReviewsModule,
    ReservationModule,
    TablesModule,
    ObjectsModule,
    SectionObjectsModule,
  ],
})
export class FeaturesModule {}
