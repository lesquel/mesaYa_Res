/**
 * Chat Conversation Controller - REST API for chat history
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIn,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '@features/auth/interface/guards/jwt-optional-auth.guard';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { Request } from 'express';

/** Authenticated request with optional user */
interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

import {
  ChatConversationService,
  CreateConversationDto,
  AddMessageDto,
} from '../application/chat-conversation.service';
import { ChatConversationEntity } from '../domain/entities';

/**
 * DTO for sentiment in a message
 */
class SentimentDto {
  @ApiProperty({ enum: ['positive', 'negative', 'neutral'] })
  @IsIn(['positive', 'negative', 'neutral'])
  label: 'positive' | 'negative' | 'neutral';

  @ApiProperty()
  @IsNumber()
  score: number;
}

/**
 * DTO for creating a conversation via API
 */
class CreateConversationRequestDto {
  @ApiProperty({ description: 'Frontend session identifier' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    enum: ['guest', 'user', 'owner', 'admin'],
    required: false,
  })
  @IsOptional()
  @IsIn(['guest', 'user', 'owner', 'admin'])
  accessLevel?: 'guest' | 'user' | 'owner' | 'admin';

  @ApiProperty({ enum: ['es', 'en'], required: false })
  @IsOptional()
  @IsIn(['es', 'en'])
  language?: 'es' | 'en';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

/**
 * DTO for adding a message via API
 */
class AddMessageRequestDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false, type: SentimentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SentimentDto)
  sentiment?: SentimentDto;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toolsUsed?: string[];
}

/**
 * Response DTO for conversation
 */
class ConversationResponseDto {
  id: string;
  userId: string | null;
  sessionId: string;
  accessLevel: string;
  language: string;
  restaurantId: string | null;
  messageCount: number;
  messages: {
    role: string;
    content: string;
    timestamp: Date;
    imageUrl?: string;
    sentiment?: { label: string; score: number };
    toolsUsed?: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ChatConversationEntity): ConversationResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      sessionId: entity.sessionId,
      accessLevel: entity.accessLevel,
      language: entity.language,
      restaurantId: entity.restaurantId,
      messageCount: entity.messageCount,
      messages: entity.messages,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

/**
 * Controller for chat conversation history management.
 */
@ApiTags('Chat History')
@Controller({ path: 'chat/conversations', version: '1' })
export class ChatConversationController {
  constructor(private readonly conversationService: ChatConversationService) {}

  /**
   * Create a new conversation.
   * Extracts userId from JWT token if authenticated.
   */
  @Post()
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new chat conversation',
    description:
      'Creates a new conversation. If authenticated, associates with the user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: ConversationResponseDto,
  })
  async createConversation(
    @Body() dto: CreateConversationRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConversationResponseDto> {
    // Extract userId from JWT if authenticated
    const userId = req.user?.userId;

    const createDto: CreateConversationDto = {
      sessionId: dto.sessionId,
      userId, // Pass userId from JWT token
      accessLevel: dto.accessLevel,
      language: dto.language,
      restaurantId: dto.restaurantId,
      metadata: dto.metadata,
    };

    const conversation =
      await this.conversationService.createConversation(createDto);
    return ConversationResponseDto.fromEntity(conversation);
  }

  /**
   * Get or create a conversation by session ID
   * Extracts userId from JWT token if authenticated.
   */
  @Post('session')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get or create a conversation by session ID',
    description:
      'Returns existing conversation or creates a new one. If authenticated, associates the conversation with the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation found or created',
    type: ConversationResponseDto,
  })
  async getOrCreateConversation(
    @Body() dto: CreateConversationRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConversationResponseDto> {
    // Extract userId from JWT if authenticated
    const userId = req.user?.userId;

    const createDto: CreateConversationDto = {
      sessionId: dto.sessionId,
      userId, // Pass userId from JWT token
      accessLevel: dto.accessLevel,
      language: dto.language,
      restaurantId: dto.restaurantId,
      metadata: dto.metadata,
    };

    const conversation =
      await this.conversationService.getOrCreateConversation(createDto);
    return ConversationResponseDto.fromEntity(conversation);
  }

  /**
   * Get conversation by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a conversation by ID',
    description: 'Retrieves a specific conversation with all messages.',
  })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation found',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found',
  })
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConversationResponseDto | null> {
    const conversation = await this.conversationService.getConversationById(id);
    return conversation
      ? ConversationResponseDto.fromEntity(conversation)
      : null;
  }

  /**
   * Get conversation by session ID
   */
  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get a conversation by session ID',
    description: 'Retrieves the most recent conversation for a session.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session identifier' })
  @ApiResponse({
    status: 200,
    description: 'Conversation found',
    type: ConversationResponseDto,
  })
  async getConversationBySession(
    @Param('sessionId') sessionId: string,
  ): Promise<ConversationResponseDto | null> {
    const conversation =
      await this.conversationService.getConversationBySessionId(sessionId);
    return conversation
      ? ConversationResponseDto.fromEntity(conversation)
      : null;
  }

  /**
   * Get user's conversations (requires authentication)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user conversations',
    description: 'Lists all conversations for the authenticated user.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
  })
  async getUserConversations(
    @CurrentUser() user: { userId: string },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<{ data: ConversationResponseDto[]; total: number }> {
    const { data, total } = await this.conversationService.getUserConversations(
      user.userId,
      limit,
      offset,
    );

    return {
      data: data.map((c) => ConversationResponseDto.fromEntity(c)),
      total,
    };
  }

  /**
   * Add a message to a conversation
   */
  @Post(':id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add a message to a conversation',
    description: 'Adds a new message (user or assistant) to the conversation.',
  })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Message added successfully',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found',
  })
  async addMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMessageRequestDto,
  ): Promise<ConversationResponseDto> {
    const messageDto: AddMessageDto = {
      role: dto.role,
      content: dto.content,
      imageUrl: dto.imageUrl,
      sentiment: dto.sentiment,
      toolsUsed: dto.toolsUsed,
    };

    const conversation = await this.conversationService.addMessage(
      id,
      messageDto,
    );
    return ConversationResponseDto.fromEntity(conversation);
  }

  /**
   * Delete a conversation (requires authentication)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a conversation',
    description:
      'Deletes a conversation. User can only delete their own conversations.',
  })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({
    status: 204,
    description: 'Conversation deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found',
  })
  async deleteConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    await this.conversationService.deleteConversation(id, user.userId);
  }
}
