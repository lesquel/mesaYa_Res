import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { ReviewsController } from './interface/controllers/reviews.controller.js';
import { ReviewOrmEntity } from './infrastructure/orm/review.orm-entity.js';
import { RestaurantOrmEntity } from '../restaurants/infrastructure/orm/restaurant.orm-entity.js';
import { User } from '../../auth/entities/user.entity.js';
import { ReviewTypeOrmRepository } from './infrastructure/repositories/review-typeorm.repository.js';
import { RestaurantTypeOrmReviewProvider } from './infrastructure/providers/restaurant-typeorm.provider.js';
import { UserTypeOrmReviewProvider } from './infrastructure/providers/user-typeorm.provider.js';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case.js';
import { ListReviewsUseCase } from './application/use-cases/list-reviews.use-case.js';
import { ListRestaurantReviewsUseCase } from './application/use-cases/list-restaurant-reviews.use-case.js';
import { FindReviewUseCase } from './application/use-cases/find-review.use-case.js';
import { UpdateReviewUseCase } from './application/use-cases/update-review.use-case.js';
import { DeleteReviewUseCase } from './application/use-cases/delete-review.use-case.js';
import { REVIEW_REPOSITORY } from './application/ports/review-repository.port.js';
import { RESTAURANT_REVIEW_READER } from './application/ports/restaurant-reader.port.js';
import { USER_REVIEW_READER } from './application/ports/user-reader.port.js';

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
