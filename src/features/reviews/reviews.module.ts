import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '@features/auth/auth.module';
import { ReviewsController } from './interface';
import {
  ReviewOrmEntity,
  ReviewTypeOrmRepository,
  RestaurantTypeOrmReviewProvider,
  UserTypeOrmReviewProvider,
  ReviewAnalyticsTypeOrmRepository,
  SentimentAnalysisService,
} from './infrastructure';
import {
  CreateReviewUseCase,
  ListReviewsUseCase,
  ListRestaurantReviewsUseCase,
  FindReviewUseCase,
  DeleteReviewUseCase,
  UpdateReviewUseCase,
  ModerateReviewUseCase,
  ReviewsService,
  REVIEW_REPOSITORY,
  RESTAURANT_REVIEW_READER,
  USER_REVIEW_READER,
  GetReviewAnalyticsUseCase,
  REVIEW_ANALYTICS_REPOSITORY,
  type ReviewRepositoryPort,
  type ReviewAnalyticsRepositoryPort,
  ReviewsAccessService,
  UpdateReviewSentimentUseCase,
  ReviewSentimentHandler,
} from './application';
import {
  ReviewDomainService,
  IReviewDomainRepositoryPort,
  type ReviewRestaurantPort,
  type ReviewUserPort,
} from './domain';
import { REVIEW_RESTAURANT_PORT } from './domain/ports/review-restaurant.port';
import { REVIEW_USER_PORT } from './domain/ports/review-user.port';
import { KafkaService } from '@shared/infrastructure/kafka';
import { RestaurantOrmEntity } from '../restaurants';

/**
 * Reviews module.
 *
 * Note: UserOrmEntity is NOT imported here because users live in Auth MS.
 * The userId is stored as a plain UUID reference and we trust the JWT token.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewOrmEntity, RestaurantOrmEntity]),
    AuthModule,
  ],
  controllers: [ReviewsController],
  providers: [
    ReviewTypeOrmRepository,
    RestaurantTypeOrmReviewProvider,
    UserTypeOrmReviewProvider,
    ReviewAnalyticsTypeOrmRepository,
    ReviewsAccessService,
    {
      provide: REVIEW_REPOSITORY,
      useExisting: ReviewTypeOrmRepository,
    },
    {
      provide: RESTAURANT_REVIEW_READER,
      useExisting: RestaurantTypeOrmReviewProvider,
    },
    {
      provide: USER_REVIEW_READER,
      useExisting: UserTypeOrmReviewProvider,
    },
    {
      provide: REVIEW_ANALYTICS_REPOSITORY,
      useExisting: ReviewAnalyticsTypeOrmRepository,
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
      provide: ModerateReviewUseCase,
      useFactory: (reviewDomainService: ReviewDomainService) =>
        new ModerateReviewUseCase(reviewDomainService),
      inject: [ReviewDomainService],
    },
    {
      provide: GetReviewAnalyticsUseCase,
      useFactory: (analyticsRepository: ReviewAnalyticsRepositoryPort) =>
        new GetReviewAnalyticsUseCase(analyticsRepository),
      inject: [REVIEW_ANALYTICS_REPOSITORY],
    },
    // ReviewsService uses @Injectable() decorator with direct constructor injection
    ReviewsService,
    // Sentiment Analysis providers
    {
      provide: SentimentAnalysisService,
      useFactory: (configService: ConfigService) =>
        new SentimentAnalysisService(configService),
      inject: [ConfigService],
    },
    {
      provide: UpdateReviewSentimentUseCase,
      useFactory: (reviewDomainService: ReviewDomainService) =>
        new UpdateReviewSentimentUseCase(reviewDomainService),
      inject: [ReviewDomainService],
    },
    {
      provide: ReviewSentimentHandler,
      useFactory: (
        kafkaService: KafkaService,
        sentimentAnalysisService: SentimentAnalysisService,
        updateReviewSentimentUseCase: UpdateReviewSentimentUseCase,
      ) =>
        new ReviewSentimentHandler(
          kafkaService,
          sentimentAnalysisService,
          updateReviewSentimentUseCase,
        ),
      inject: [
        KafkaService,
        SentimentAnalysisService,
        UpdateReviewSentimentUseCase,
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
    ModerateReviewUseCase,
    ReviewsService,
    GetReviewAnalyticsUseCase,
    REVIEW_REPOSITORY,
    ReviewsAccessService,
    UpdateReviewSentimentUseCase,
  ],
})
export class ReviewsModule {}
