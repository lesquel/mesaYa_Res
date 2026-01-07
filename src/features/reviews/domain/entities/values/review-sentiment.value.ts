/**
 * Review Sentiment Value Object
 *
 * Encapsulates the sentiment analysis result for a review.
 * Includes the sentiment classification, confidence score, and extracted keywords.
 */

import { SentimentType } from '../../enums';

export interface SentimentData {
  type: SentimentType;
  confidence: number;
  keywords: string[];
  analyzedAt: Date;
}

export class ReviewSentiment {
  private constructor(
    private readonly _type: SentimentType,
    private readonly _confidence: number,
    private readonly _keywords: string[],
    private readonly _analyzedAt: Date,
  ) {}

  /**
   * Create a new sentiment analysis result
   */
  static create(
    type: SentimentType,
    confidence: number,
    keywords: string[] = [],
    analyzedAt: Date = new Date(),
  ): ReviewSentiment {
    // Validate confidence is between 0 and 1
    const normalizedConfidence = Math.max(0, Math.min(1, confidence));

    return new ReviewSentiment(
      type,
      normalizedConfidence,
      keywords,
      analyzedAt,
    );
  }

  /**
   * Create a pending sentiment (not yet analyzed)
   */
  static pending(): ReviewSentiment {
    return new ReviewSentiment(
      SentimentType.NEUTRAL,
      0,
      [],
      new Date(0), // Epoch indicates not analyzed
    );
  }

  /**
   * Rehydrate from stored data
   */
  static rehydrate(data: SentimentData | null): ReviewSentiment | null {
    if (!data) return null;
    return new ReviewSentiment(
      data.type,
      data.confidence,
      data.keywords,
      data.analyzedAt,
    );
  }

  get type(): SentimentType {
    return this._type;
  }

  get confidence(): number {
    return this._confidence;
  }

  get keywords(): string[] {
    return [...this._keywords];
  }

  get analyzedAt(): Date {
    return this._analyzedAt;
  }

  get isAnalyzed(): boolean {
    return this._analyzedAt.getTime() > 0;
  }

  get isPositive(): boolean {
    return this._type === SentimentType.POSITIVE;
  }

  get isNegative(): boolean {
    return this._type === SentimentType.NEGATIVE;
  }

  get isNeutral(): boolean {
    return this._type === SentimentType.NEUTRAL;
  }

  /**
   * Serialize to plain object for storage
   */
  toData(): SentimentData {
    return {
      type: this._type,
      confidence: this._confidence,
      keywords: this._keywords,
      analyzedAt: this._analyzedAt,
    };
  }
}
