/**
 * Update Review Sentiment Use Case
 *
 * Updates the sentiment analysis results for a review.
 * Called asynchronously after review creation via Kafka events.
 */

import { Logger } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { SentimentType } from '../../domain/enums';
import { ReviewDomainService } from '../../domain';

export interface UpdateReviewSentimentCommand {
  reviewId: string;
  sentiment: SentimentType;
  confidence: number;
  keywords: string[];
}

export interface UpdateReviewSentimentResult {
  success: boolean;
  reviewId: string;
  sentiment?: SentimentType;
  error?: string;
}

export class UpdateReviewSentimentUseCase
  implements UseCase<UpdateReviewSentimentCommand, UpdateReviewSentimentResult>
{
  private readonly logger = new Logger(UpdateReviewSentimentUseCase.name);

  constructor(private readonly reviewDomainService: ReviewDomainService) {}

  async execute(
    command: UpdateReviewSentimentCommand,
  ): Promise<UpdateReviewSentimentResult> {
    this.logger.log(
      `Updating sentiment for review ${command.reviewId}: ${command.sentiment}`,
    );

    try {
      const review = await this.reviewDomainService.findById(command.reviewId);

      if (!review) {
        this.logger.warn(`Review not found: ${command.reviewId}`);
        return {
          success: false,
          reviewId: command.reviewId,
          error: 'Review not found',
        };
      }

      // Update sentiment on the domain entity
      review.updateSentiment(
        command.sentiment,
        command.confidence,
        command.keywords,
      );

      // Persist the updated review
      await this.reviewDomainService.save(review);

      this.logger.log(
        `Sentiment updated for review ${command.reviewId}: ${command.sentiment} (confidence: ${command.confidence})`,
      );

      return {
        success: true,
        reviewId: command.reviewId,
        sentiment: command.sentiment,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Failed to update sentiment for review ${command.reviewId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        reviewId: command.reviewId,
        error: errorMessage,
      };
    }
  }
}
