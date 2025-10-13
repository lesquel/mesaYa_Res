import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { User } from '../../auth/entities/user.entity.js';
import { ReviewsController } from './interface/index.js';
import {
  ReviewOrmEntity,
  ReviewTypeOrmRepository,
  RestaurantTypeOrmReviewProvider,
  UserTypeOrmReviewProvider,
} from './infrastructure/index.js';
import {
  CreateReviewUseCase,
  ListReviewsUseCase,
  ListRestaurantReviewsUseCase,
  FindReviewUseCase,
  DeleteReviewUseCase,
  UpdateReviewUseCase,
  ReviewsService,
  REVIEW_REPOSITORY,
  RESTAURANT_REVIEW_READER,
  USER_REVIEW_READER,
} from './application/index.js';
import { RestaurantOrmEntity } from '../restaurants/index.js';

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
    ReviewsService,
  ],
  exports: [
    CreateReviewUseCase,
    ListReviewsUseCase,
    ListRestaurantReviewsUseCase,
    FindReviewUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    ReviewsService,
  ],
})
export class ReviewsModule {}
