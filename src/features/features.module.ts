import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module.js';
import { SectionsModule } from './sections/sections.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { ReservationModule } from './reservation/reservation.module.js';
import { TablesModule } from './tables/tables.module.js';
import { ObjectsModule } from './objects/objects.module.js';
import { SectionObjectsModule } from './section-objects/section-objects.module.js';
import { MenusModule } from './menus/menus.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { SubscriptionModule } from './subscription/subscription.module.js';
import { ImagesModule } from './images/images.module.js';

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
    ImagesModule,
    MenusModule,
    PaymentModule,
    SubscriptionModule,
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
    ImagesModule,
    MenusModule,
    PaymentModule,
    SubscriptionModule,
  ],
})
export class FeaturesModule {}
