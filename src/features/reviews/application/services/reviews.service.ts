import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
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
  ModerateReviewCommand,
} from '../dto';
import {
  CreateReviewUseCase,
  DeleteReviewUseCase,
  FindReviewUseCase,
  ListRestaurantReviewsUseCase,
  ListReviewsUseCase,
  ModerateReviewUseCase,
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
    private readonly moderateReviewUseCase: ModerateReviewUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Emits `mesa-ya.reviews.events` with event_type='created' and returns the created review DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEWS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [CreateReviewCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
        metadata: { user_id: command.userId },
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
   * Emits `mesa-ya.reviews.events` with event_type='updated' and returns the updated review DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEWS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateReviewCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
        metadata: { user_id: command.userId },
      };
    },
  })
  async update(command: UpdateReviewCommand): Promise<ReviewResponseDto> {
    return this.updateReviewUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.reviews.events` with event_type='updated' for moderation.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEWS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [ModerateReviewCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: command.reviewId,
        data: entity,
        metadata: { action: 'moderated' },
      };
    },
  })
  async moderate(command: ModerateReviewCommand): Promise<ReviewResponseDto> {
    return this.moderateReviewUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.reviews.events` with event_type='deleted' and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.REVIEWS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteReviewCommand];
      const { review } = result as DeleteReviewResponseDto;
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: review.id,
        data: toPlain(review),
        metadata: { user_id: command.userId },
      };
    },
  })
  async delete(command: DeleteReviewCommand): Promise<DeleteReviewResponseDto> {
    return this.deleteReviewUseCase.execute(command);
  }
}
