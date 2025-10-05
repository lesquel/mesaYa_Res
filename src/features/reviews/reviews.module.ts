import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { ReviewsController } from './interface/controllers/reviews.controller.js';
import { ReviewOrmEntity } from './infrastructure/orm/review.orm-entity.js';
import { RestaurantOrmEntity } from '../restaurants/infrastructure/orm/restaurant.orm-entity.js';
import { User } from '../../auth/entities/user.entity.js';
import { ReviewTypeOrmRepository } from './infrastructure/repositories';
import {
  RestaurantTypeOrmReviewProvider,
  UserTypeOrmReviewProvider,
} from './infrastructure/providers';
import {
  CreateReviewUseCase,
  ListReviewsUseCase,
  ListRestaurantReviewsUseCase,
  FindReviewUseCase,
  DeleteReviewUseCase,
  UpdateReviewUseCase,
} from './application/use-cases';
import {
  REVIEW_REPOSITORY,
  RESTAURANT_REVIEW_READER,
  USER_REVIEW_READER,
} from './application/ports';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewOrmEntity, RestaurantOrmEntity, User]),
    AuthModule,
  ],
  controllers: [ReviewsController],
  providers: [
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewTypeOrmRepository,
    },
    {
      provide: RESTAURANT_REVIEW_READER,
      useClass: RestaurantTypeOrmReviewProvider,
    },
    {
      provide: USER_REVIEW_READER,
      useClass: UserTypeOrmReviewProvider,
    },
    CreateReviewUseCase,
    ListReviewsUseCase,
    ListRestaurantReviewsUseCase,
    FindReviewUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
  ],
  exports: [
    CreateReviewUseCase,
    ListReviewsUseCase,
    ListRestaurantReviewsUseCase,
    FindReviewUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
  ],
})
export class ReviewsModule {}
