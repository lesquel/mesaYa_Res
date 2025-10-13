import { Module } from '@nestjs/common';
import { SeedModule } from './seed/seed.module';
import { AppConfigModule } from '@shared/infrastructure/adapters/app-config/app-config.module';
import { DatabaseModule } from '@shared/infrastructure/adapters/database/database.module';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { AppController } from './app.controller';
import { BookingModule } from './features/booking/booking.module';
import { RestaurantsModule } from './features/restaurants/restaurants.module';
import { SectionsModule } from './features/sections/sections.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { KafkaModule } from '@shared/infrastructure/kafka';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    LoggerModule,
    KafkaModule,
    SeedModule,
    BookingModule,
    RestaurantsModule,
    SectionsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
