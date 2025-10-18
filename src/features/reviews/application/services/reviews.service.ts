import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '../../../../shared/infrastructure/kafka/index.js';
import type {
  CreateReviewCommand,
  DeleteReviewCommand,
  DeleteReviewResponseDto,
  FindReviewQuery,
  ListRestaurantReviewsQuery,
  ListReviewsQuery,
  PaginatedReviewResponse,
  ReviewResponseDto,
  UpdateReviewCommand,
} from '../dto/index.js';
import {
  CreateReviewUseCase,
  DeleteReviewUseCase,
  FindReviewUseCase,
  ListRestaurantReviewsUseCase,
  ListReviewsUseCase,
  UpdateReviewUseCase,
} from '../use-cases/index.js';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly listReviewsUseCase: ListReviewsUseCase,
    private readonly listRestaurantReviewsUseCase: ListRestaurantReviewsUseCase,
    private readonly findReviewUseCase: FindReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEW_CREATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [CreateReviewCommand];
      return {
        action: 'review.created',
        entity: toPlain(result),
        performedBy: command.userId,
      };
    },
  })
  async create(command: CreateReviewCommand): Promise<ReviewResponseDto> {
    return this.createReviewUseCase.execute(command);
  }

  async list(query: ListReviewsQuery): Promise<PaginatedReviewResponse> {
    return this.listReviewsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantReviewsQuery,
  ): Promise<PaginatedReviewResponse> {
    return this.listRestaurantReviewsUseCase.execute(query);
  }

  async findOne(query: FindReviewQuery): Promise<ReviewResponseDto> {
    return this.findReviewUseCase.execute(query);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEW_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateReviewCommand];
      return {
        action: 'review.updated',
        entity: toPlain(result),
        performedBy: command.userId,
      };
    },
  })
  async update(command: UpdateReviewCommand): Promise<ReviewResponseDto> {
    return this.updateReviewUseCase.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEW_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteReviewCommand];
      return {
        action: 'review.deleted',
        entityId: command.reviewId,
        performedBy: command.userId,
        result: toPlain(result),
      };
    },
  })
  async delete(command: DeleteReviewCommand): Promise<DeleteReviewResponseDto> {
    return this.deleteReviewUseCase.execute(command);
  }
}
