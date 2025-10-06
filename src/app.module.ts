import { Module } from '@nestjs/common';
import { SeedModule } from './seed/seed.module';
import { RestaurantsModule } from './features/restaurants/restaurants.module';
import { SectionsModule } from './features/sections/sections.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { AppConfigModule } from '@shared/core/config/config.module';
import { DatabaseModule } from '@shared/core/database/database.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    SeedModule,
    RestaurantsModule,
    SectionsModule,
    AuthModule,
    ReviewsModule,
  ],
})
export class AppModule {}
