/**
 * Chatbot DTOs - Request and Response data transfer objects
 */

import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Supported languages for chatbot responses
 */
export type ChatLanguage = 'es' | 'en';

/**
 * Access levels for chatbot features
 * Determines what capabilities and information the chatbot can provide.
 */
export type ChatAccessLevel = 'guest' | 'user' | 'owner' | 'admin';

/**
 * Message in conversation history
 */
export class ChatHistoryMessageDto {
  @ApiProperty({
    description: 'Message sender',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  @IsIn(['user', 'assistant'], {
    message: 'Role must be either "user" or "assistant"',
  })
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @ApiProperty({
    description: 'Message content',
    example: 'How do I make a reservation?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

/**
 * Chat request DTO - Matches the Python chatbot service contract
 */
export class ChatRequestDto {
  @ApiProperty({
    description: 'User access level for feature control',
    enum: ['guest', 'user', 'owner', 'admin'],
    example: 'guest',
    default: 'guest',
  })
  @IsOptional()
  @IsIn(['guest', 'user', 'owner', 'admin'], {
    message: 'Access level must be guest, user, owner, or admin',
  })
  access_level?: ChatAccessLevel = 'guest';

  @ApiPropertyOptional({
    description:
      'Legacy user role in the platform (deprecated, use access_level)',
    enum: ['client', 'restaurant'],
    example: 'client',
  })
  @IsOptional()
  @IsIn(['client', 'restaurant'], {
    message: 'Role must be either "client" or "restaurant"',
  })
  role?: 'client' | 'restaurant';

  @ApiProperty({
    description: 'User message or question',
    example: 'How do I make a reservation?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MaxLength(1000, { message: 'Message cannot exceed 1000 characters' })
  message: string;

  @ApiPropertyOptional({
    description: 'Response language (es for Spanish, en for English)',
    enum: ['es', 'en'],
    default: 'es',
    example: 'es',
  })
  @IsOptional()
  @IsIn(['es', 'en'], { message: 'Language must be either "es" or "en"' })
  language?: ChatLanguage = 'es';

  @ApiPropertyOptional({
    description: 'Conversation history for context (max 20 messages)',
    type: [ChatHistoryMessageDto],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'History cannot exceed 20 messages' })
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryMessageDto)
  history?: ChatHistoryMessageDto[] = [];

  @ApiPropertyOptional({
    description: 'User ID for personalized responses (authenticated users)',
    example: 'user-123',
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'User email for reservation lookups (authenticated users)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  user_email?: string;

  @ApiPropertyOptional({
    description: 'Restaurant ID for owner context (owners only)',
    example: 'rest-456',
  })
  @IsOptional()
  @IsString()
  restaurant_id?: string;

  @ApiPropertyOptional({
    description: 'Image URL for multimodal analysis (optional)',
    example: 'https://storage.example.com/images/photo.jpg',
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}

/**
 * Chat response DTO - Matches the Python chatbot service response
 */
export class ChatResponseDto {
  @ApiProperty({
    description: 'AI-generated response from the chatbot',
    example:
      'Para hacer una reserva:\n1. Busca el restaurante deseado\n2. Selecciona fecha y hora\n3. Confirma tu reservación',
  })
  response: string;

  @ApiPropertyOptional({
    description: 'Sentiment analysis of the user message',
    example: { label: 'positive', score: 0.85 },
  })
  sentiment?: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };

  @ApiPropertyOptional({
    description: 'List of MCP tools used to generate the response',
    example: ['search_restaurants', 'get_menu'],
  })
  tools_used?: string[];
}

/**
 * Chatbot error response DTO
 */
export class ChatbotErrorDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Chatbot service is temporarily unavailable',
  })
  message: string;

  @ApiProperty({
    description: 'Error code',
    example: 'CHATBOT_UNAVAILABLE',
  })
  code: string;
}
