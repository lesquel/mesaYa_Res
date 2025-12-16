/**
 * Chatbot Controller - REST API endpoint for chatbot interactions
 */

import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import {
  ChatRequestDto,
  ChatResponseDto,
  ChatbotErrorDto,
} from '../domain/chatbot.dto';
import { ChatbotService } from '../application/chatbot.service';
import { CHATBOT_SERVICE } from '../chatbot.tokens';

/**
 * Controller for chatbot interactions.
 *
 * Provides a REST endpoint that proxies requests to the Python chatbot
 * microservice, maintaining clean separation between NestJS and Python.
 *
 * Note: This endpoint is publicly accessible (no JWT required).
 * Rate limiting is handled by the chatbot microservice.
 */
@ApiTags('Chatbot')
@Controller({ path: 'chatbot', version: '1' })
export class ChatbotController {
  constructor(
    @Inject(CHATBOT_SERVICE)
    private readonly chatbotService: ChatbotService,
  ) {}

  /**
   * Send a message to the chatbot.
   *
   * @param request - Chat request with role and message
   * @returns AI-generated response
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a message to the AI chatbot',
    description:
      'Processes a user message and returns an AI-generated response. ' +
      'The response is tailored based on the user role (client or restaurant).',
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Successful chatbot response',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  @ApiResponse({
    status: 503,
    description: 'Chatbot service unavailable',
    type: ChatbotErrorDto,
  })
  async chat(@Body() request: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      return await this.chatbotService.sendMessage(request);
    } catch (error) {
      throw new HttpException(
        {
          message:
            error instanceof Error ? error.message : 'Chatbot service error',
          code: 'CHATBOT_ERROR',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Check chatbot service health.
   */
  @Get('health')
  @ApiOperation({
    summary: 'Check chatbot service health',
    description: 'Returns the health status of the chatbot microservice.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check result',
  })
  async health(): Promise<{ status: string; service: string }> {
    const isHealthy = await this.chatbotService.isHealthy();

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'chatbot',
    };
  }
}
