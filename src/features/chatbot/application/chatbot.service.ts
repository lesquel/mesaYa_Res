/**
 * Chatbot Service - Communicates with the Python chatbot microservice
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ChatRequestDto, ChatResponseDto } from '../domain/chatbot.dto';

/**
 * Service for communicating with the MesaYa Chatbot microservice.
 *
 * This service acts as an adapter between NestJS and the Python-based
 * chatbot service, handling HTTP communication and error handling.
 */
@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly chatbotUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.chatbotUrl =
      this.configService.get<string>('CHATBOT_SERVICE_URL') ||
      'http://localhost:8001';
    this.timeoutMs =
      this.configService.get<number>('CHATBOT_TIMEOUT_MS') || 30000;

    this.logger.log(`Chatbot service URL: ${this.chatbotUrl}`);
  }

  /**
   * Send a message to the chatbot and get a response.
   *
   * @param request - The chat request with role, message, language, and history
   * @returns Promise with the chatbot response
   * @throws Error if the chatbot service is unavailable
   */
  async sendMessage(request: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.debug(
      `Sending message to chatbot: role=${request.role}, lang=${request.language}, message="${request.message.substring(0, 50)}..."`,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.chatbotUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: request.role,
          message: request.message,
          language: request.language ?? 'es',
          history: request.history ?? [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      const data = (await response.json()) as ChatResponseDto;
      this.logger.debug('Chatbot response received successfully');
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          this.logger.error('Chatbot request timed out');
          throw new Error('Chatbot service timed out');
        }
        this.logger.error(
          `Failed to communicate with chatbot service: ${error.message}`,
        );
        throw error;
      }

      this.logger.error('Failed to communicate with chatbot service', error);
      throw new Error('Chatbot service is unavailable');
    }
  }

  /**
   * Check if the chatbot service is healthy.
   *
   * @returns Promise<boolean> - true if healthy, false otherwise
   */
  async isHealthy(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${this.chatbotUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { status: string };
      return data?.status === 'healthy';
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  }

  /**
   * Handle HTTP errors from the chatbot service.
   */
  private async handleHttpError(response: Response): Promise<Error> {
    if (response.status === 429) {
      return new Error('Chatbot rate limit exceeded. Please try again later.');
    }

    if (response.status === 422) {
      return new Error('Invalid request to chatbot service');
    }

    if (response.status >= 500) {
      return new Error('Chatbot service is temporarily unavailable');
    }

    const errorText = await response.text().catch(() => 'Unknown error');
    return new Error(`Chatbot error: ${errorText}`);
  }
}
