import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { SectionsModule } from './sections/sections.module';
import { AuthModule } from '../auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [RestaurantsModule, SectionsModule, AuthModule, ReviewsModule],
  exports: [RestaurantsModule, SectionsModule, AuthModule, ReviewsModule],
})
export class FeaturesModule {}
