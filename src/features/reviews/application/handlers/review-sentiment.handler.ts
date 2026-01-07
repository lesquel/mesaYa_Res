/**
 * Review Sentiment Handler
 *
 * Handles Kafka events for review sentiment analysis.
 * Listens to review.created events and triggers async sentiment analysis.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
import { SentimentAnalysisService } from '../../infrastructure/services';
import { UpdateReviewSentimentUseCase } from '../use-cases/update-review-sentiment.use-case';

interface ReviewCreatedEvent {
  event_type: string;
  entity_id: string;
  timestamp: string;
  data: {
    id: string;
    rating: number;
    comment: string | null;
    restaurantId: string;
    userId: string;
  };
  metadata?: {
    user_id?: string;
  };
}

@Injectable()
export class ReviewSentimentHandler implements OnModuleInit {
  private readonly logger = new Logger(ReviewSentimentHandler.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly sentimentAnalysisService: SentimentAnalysisService,
    private readonly updateReviewSentimentUseCase: UpdateReviewSentimentUseCase,
  ) {}

  onModuleInit(): void {
    this.registerKafkaConsumer();
  }

  /**
   * Register the Kafka consumer for review events
   */
  private registerKafkaConsumer(): void {
    this.kafkaService.addConsumer({
      topic: KAFKA_TOPICS.REVIEWS,
      groupId: 'mesa-ya-sentiment-analyzer',
      handler: async (payload: unknown) => {
        await this.handleReviewEvent(payload as ReviewCreatedEvent);
      },
    });

    this.logger.log(
      `Registered Kafka consumer for topic: ${KAFKA_TOPICS.REVIEWS}`,
    );
  }

  /**
   * Handle review events from Kafka
   */
  private async handleReviewEvent(event: ReviewCreatedEvent): Promise<void> {
    // Only process 'created' events
    if (event.event_type !== EVENT_TYPES.CREATED) {
      this.logger.debug(
        `Skipping event type: ${event.event_type} for review ${event.entity_id}`,
      );
      return;
    }

    const reviewId = event.entity_id || event.data?.id;
    const comment = event.data?.comment;
    const rating = event.data?.rating;

    if (!reviewId) {
      this.logger.warn('Received review event without entity_id');
      return;
    }

    // Skip if no comment to analyze
    if (!comment || comment.trim().length < 3) {
      this.logger.debug(
        `Skipping sentiment analysis for review ${reviewId}: no comment or too short`,
      );
      return;
    }

    this.logger.log(`Processing sentiment analysis for review ${reviewId}`);

    try {
      // Call MCP to analyze sentiment
      const sentimentResult =
        await this.sentimentAnalysisService.analyzeReviewSentiment(
          comment,
          rating ?? 3,
        );

      if (!sentimentResult) {
        this.logger.warn(
          `Sentiment analysis returned null for review ${reviewId}`,
        );
        return;
      }

      // Update the review with sentiment data
      const updateResult = await this.updateReviewSentimentUseCase.execute({
        reviewId,
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        keywords: sentimentResult.keywords,
      });

      if (updateResult.success) {
        this.logger.log(
          `Successfully updated sentiment for review ${reviewId}: ${updateResult.sentiment}`,
        );
      } else {
        this.logger.error(
          `Failed to update sentiment for review ${reviewId}: ${updateResult.error}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing sentiment for review ${reviewId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
