import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka';
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
} from '../dto';
import {
  CreateReviewUseCase,
  DeleteReviewUseCase,
  FindReviewUseCase,
  ListRestaurantReviewsUseCase,
  ListReviewsUseCase,
  UpdateReviewUseCase,
} from '../use-cases';

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

  /**
   * Emits `mesa-ya.reviews.created` with `{ action, entity, performedBy }` and returns the created review DTO.
   */
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

  /**
   * Emits `mesa-ya.reviews.updated` with `{ action, entity, performedBy }` and returns the updated review DTO.
   */
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

  /**
   * Emits `mesa-ya.reviews.deleted` with `{ action, entityId, entity, performedBy }` and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEW_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteReviewCommand];
      const { review } = result as DeleteReviewResponseDto;
      return {
        action: 'review.deleted',
        entityId: review.id,
        performedBy: command.userId,
        entity: toPlain(review),
      };
    },
  })
  async delete(command: DeleteReviewCommand): Promise<DeleteReviewResponseDto> {
    return this.deleteReviewUseCase.execute(command);
  }
}
