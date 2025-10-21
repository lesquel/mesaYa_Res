import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import { ReviewsController } from './interface/index';
import {
  ReviewOrmEntity,
  ReviewTypeOrmRepository,
  RestaurantTypeOrmReviewProvider,
  UserTypeOrmReviewProvider,
} from './infrastructure/index';
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
  type ReviewRepositoryPort,
} from './application/index';
import {
  ReviewDomainService,
  IReviewDomainRepositoryPort,
  type ReviewRestaurantPort,
  type ReviewUserPort,
} from './domain/index';
import { REVIEW_RESTAURANT_PORT } from './domain/ports/review-restaurant.port';
import { REVIEW_USER_PORT } from './domain/ports/review-user.port';
import { KafkaService } from '@shared/infrastructure/kafka/index';
import { RestaurantOrmEntity } from '../restaurants/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReviewOrmEntity,
      RestaurantOrmEntity,
      UserOrmEntity,
    ]),
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
    {
      provide: IReviewDomainRepositoryPort,
      useExisting: ReviewTypeOrmRepository,
    },
    {
      provide: REVIEW_RESTAURANT_PORT,
      useExisting: RestaurantTypeOrmReviewProvider,
    },
    {
      provide: REVIEW_USER_PORT,
      useExisting: UserTypeOrmReviewProvider,
    },
    {
      provide: ReviewDomainService,
      useFactory: (
        reviewRepository: IReviewDomainRepositoryPort,
        restaurantPort: ReviewRestaurantPort,
        userPort: ReviewUserPort,
      ) => new ReviewDomainService(reviewRepository, restaurantPort, userPort),
      inject: [
        IReviewDomainRepositoryPort,
        REVIEW_RESTAURANT_PORT,
        REVIEW_USER_PORT,
      ],
    },
    {
      provide: CreateReviewUseCase,
      useFactory: (reviewDomainService: ReviewDomainService) =>
        new CreateReviewUseCase(reviewDomainService),
      inject: [ReviewDomainService],
    },
    {
      provide: ListReviewsUseCase,
      useFactory: (reviewRepository: ReviewRepositoryPort) =>
        new ListReviewsUseCase(reviewRepository),
      inject: [REVIEW_REPOSITORY],
    },
    {
      provide: ListRestaurantReviewsUseCase,
      useFactory: (reviewRepository: ReviewRepositoryPort) =>
        new ListRestaurantReviewsUseCase(reviewRepository),
      inject: [REVIEW_REPOSITORY],
    },
    {
      provide: FindReviewUseCase,
      useFactory: (reviewRepository: ReviewRepositoryPort) =>
        new FindReviewUseCase(reviewRepository),
      inject: [REVIEW_REPOSITORY],
    },
    {
      provide: UpdateReviewUseCase,
      useFactory: (reviewDomainService: ReviewDomainService) =>
        new UpdateReviewUseCase(reviewDomainService),
      inject: [ReviewDomainService],
    },
    {
      provide: DeleteReviewUseCase,
      useFactory: (reviewDomainService: ReviewDomainService) =>
        new DeleteReviewUseCase(reviewDomainService),
      inject: [ReviewDomainService],
    },
    {
      provide: ReviewsService,
      useFactory: (
        createReviewUseCase: CreateReviewUseCase,
        listReviewsUseCase: ListReviewsUseCase,
        listRestaurantReviewsUseCase: ListRestaurantReviewsUseCase,
        findReviewUseCase: FindReviewUseCase,
        updateReviewUseCase: UpdateReviewUseCase,
        deleteReviewUseCase: DeleteReviewUseCase,
        kafkaService: KafkaService,
      ) =>
        new ReviewsService(
          createReviewUseCase,
          listReviewsUseCase,
          listRestaurantReviewsUseCase,
          findReviewUseCase,
          updateReviewUseCase,
          deleteReviewUseCase,
          kafkaService,
        ),
      inject: [
        CreateReviewUseCase,
        ListReviewsUseCase,
        ListRestaurantReviewsUseCase,
        FindReviewUseCase,
        UpdateReviewUseCase,
        DeleteReviewUseCase,
        KafkaService,
      ],
    },
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
