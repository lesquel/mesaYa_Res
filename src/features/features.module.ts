import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { SectionsModule } from './sections/sections.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReservationModule } from './reservation/reservation.module';
import { TablesModule } from './tables/tables.module';
import { ObjectsModule } from './objects/objects.module';
import { SectionObjectsModule } from './section-objects/section-objects.module';
import { MenusModule } from './menus/menus.module';
import { PaymentModule } from './payment/payment.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ImagesModule } from './images/images.module';
import { OwnerUpgradeModule } from './owner-upgrade/owner-upgrade.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    AuthModule,
    ReservationModule,
    SectionsModule,
    ReviewsModule,
    TablesModule,
    ObjectsModule,
    SectionObjectsModule,
    ImagesModule,
    MenusModule,
    PaymentModule,
    SubscriptionModule,
    OwnerUpgradeModule,
    RestaurantsModule,
    ChatbotModule,
  ],
  exports: [
    AuthModule,
    ReservationModule,
    SectionsModule,
    ReviewsModule,
    TablesModule,
    ObjectsModule,
    SectionObjectsModule,
    ImagesModule,
    MenusModule,
    PaymentModule,
    SubscriptionModule,
    OwnerUpgradeModule,
    RestaurantsModule,
    ChatbotModule,
  ],
})
export class FeaturesModule {}
