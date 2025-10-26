import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

// Seed Services
import {
  AuthSeedService,
  UserSeedService,
  SubscriptionSeedService,
  MediaSeedService,
  RestaurantSeedService,
  MenuSeedService,
  CustomerSeedService,
  PaymentSeedService,
} from './services';

// Feature Modules - providing abstract repositories
import { AuthModule } from '@features/auth/auth.module';
import { RestaurantsModule } from '@features/restaurants/restaurants.module';
import { SectionsModule } from '@features/sections/sections.module';
import { TablesModule } from '@features/tables/tables.module';
import { ImagesModule } from '@features/images/images.module';
import { ObjectsModule } from '@features/objects/objects.module';
import { MenusModule } from '@features/menus/menus.module';
import { SubscriptionModule } from '@features/subscription/subscription.module';
import { ReservationModule } from '@features/reservation/reservation.module';
import { ReviewsModule } from '@features/reviews/reviews.module';
import { PaymentModule } from '@features/payment/payment.module';

@Module({
  imports: [
    // Import feature modules instead of TypeOrmModule
    // Each module provides its own abstract repository ports
    AuthModule,
    RestaurantsModule,
    SectionsModule,
    TablesModule,
    ImagesModule,
    ObjectsModule,
    MenusModule,
    SubscriptionModule,
    ReservationModule,
    ReviewsModule,
    PaymentModule,
  ],
  controllers: [SeedController],
  providers: [
    SeedService,
    AuthSeedService,
    UserSeedService,
    SubscriptionSeedService,
    MediaSeedService,
    RestaurantSeedService,
    MenuSeedService,
    CustomerSeedService,
    PaymentSeedService,
  ],
})
export class SeedModule {}
