/**
 * Sentiment Analysis Service
 *
 * Communicates with the MCP server to analyze review sentiment.
 * Uses the analyze_review_sentiment tool exposed by the MCP.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentimentType } from '../../domain/enums';

export interface SentimentAnalysisResult {
  sentiment: SentimentType;
  confidence: number;
  keywords: string[];
  summary: string;
  analyzedAt: Date;
}

interface McpToolResponse {
  success: boolean;
  data?: {
    sentiment: string;
    confidence: number;
    keywords: string[];
    summary: string;
  };
  error?: string;
}

@Injectable()
export class SentimentAnalysisService {
  private readonly logger = new Logger(SentimentAnalysisService.name);
  private readonly mcpUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.mcpUrl =
      this.configService.get<string>('MCP_SERVICE_URL') ||
      'http://localhost:8002';
    this.timeoutMs = this.configService.get<number>('MCP_TIMEOUT_MS') || 30000;

    this.logger.log(`MCP service URL: ${this.mcpUrl}`);
  }

  /**
   * Analyze review sentiment using the MCP tool.
   *
   * @param text - The review text to analyze
   * @param rating - The numeric rating (1-5)
   * @returns Sentiment analysis result or null if failed
   */
  async analyzeReviewSentiment(
    text: string,
    rating: number,
  ): Promise<SentimentAnalysisResult | null> {
    this.logger.debug(
      `Analyzing sentiment for review: text="${text.substring(0, 50)}...", rating=${rating}`,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // Call the MCP tool endpoint
      const response = await fetch(
        `${this.mcpUrl}/tools/analyze_review_sentiment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            rating,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.error(
          `MCP tool call failed: ${response.status} ${response.statusText}`,
        );
        return null;
      }

      const result = (await response.json()) as McpToolResponse;

      if (!result.success || !result.data) {
        this.logger.warn(`Sentiment analysis failed: ${result.error}`);
        return null;
      }

      const sentimentType = this.mapSentimentType(result.data.sentiment);

      this.logger.log(
        `Sentiment analysis completed: ${sentimentType}, confidence=${result.data.confidence}`,
      );

      return {
        sentiment: sentimentType,
        confidence: result.data.confidence,
        keywords: result.data.keywords,
        summary: result.data.summary,
        analyzedAt: new Date(),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          this.logger.error('MCP sentiment analysis request timed out');
          return null;
        }
        this.logger.error(
          `Failed to communicate with MCP service: ${error.message}`,
        );
      } else {
        this.logger.error('Failed to communicate with MCP service', error);
      }

      return null;
    }
  }

  /**
   * Map string sentiment to SentimentType enum
   */
  private mapSentimentType(sentiment: string): SentimentType {
    switch (sentiment.toUpperCase()) {
      case 'POSITIVE':
        return SentimentType.POSITIVE;
      case 'NEGATIVE':
        return SentimentType.NEGATIVE;
      default:
        return SentimentType.NEUTRAL;
    }
  }

  /**
   * Check if the MCP service is healthy
   */
  async isHealthy(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${this.mcpUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  }
}
