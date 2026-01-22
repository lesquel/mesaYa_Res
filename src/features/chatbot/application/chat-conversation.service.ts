/**
 * Chat Conversation Service
 *
 * Service for managing chat conversation persistence and retrieval.
 */

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';

import {
  type IChatConversationRepository,
  CHAT_CONVERSATION_REPOSITORY,
  ConversationQueryOptions,
} from './ports';
import {
  ChatConversationEntity,
  CreateConversationProps,
} from '../domain/entities';

/**
 * DTO for creating a conversation
 */
export interface CreateConversationDto {
  sessionId: string;
  userId?: string;
  accessLevel?: 'guest' | 'user' | 'owner' | 'admin';
  language?: 'es' | 'en';
  restaurantId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * DTO for adding a message to a conversation
 */
export interface AddMessageDto {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
  };
  toolsUsed?: string[];
}

/**
 * Service for managing chat conversations
 */
@Injectable()
export class ChatConversationService {
  private readonly logger = new Logger(ChatConversationService.name);

  constructor(
    @Inject(CHAT_CONVERSATION_REPOSITORY)
    private readonly repository: IChatConversationRepository,
  ) {}

  /**
   * Create a new conversation
   */
  async createConversation(
    dto: CreateConversationDto,
  ): Promise<ChatConversationEntity> {
    // Ensure sessionId is never null - generate one if missing
    const sessionId =
      dto.sessionId ||
      `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.logger.debug(`Creating conversation for session: ${sessionId}`);

    const props: CreateConversationProps = {
      sessionId,
      userId: dto.userId,
      accessLevel: dto.accessLevel ?? 'guest',
      language: dto.language ?? 'es',
      restaurantId: dto.restaurantId,
      metadata: dto.metadata,
    };

    const conversation = ChatConversationEntity.create(props);
    return this.repository.save(conversation);
  }

  /**
   * Get or create a conversation by session ID
   */
  async getOrCreateConversation(
    dto: CreateConversationDto,
  ): Promise<ChatConversationEntity> {
    // Ensure sessionId is not null/undefined - generate one if missing
    const sessionId =
      dto.sessionId ||
      `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const safeDto = { ...dto, sessionId };

    // Try to find existing conversation
    const existing = await this.repository.findBySessionId(sessionId);
    if (existing) {
      this.logger.debug(
        `Found existing conversation for session: ${sessionId}`,
      );
      return existing;
    }

    // Create new conversation
    return this.createConversation(safeDto);
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string,
    dto: AddMessageDto,
  ): Promise<ChatConversationEntity> {
    const conversation = await this.repository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    conversation.addMessage(dto.role, dto.content, {
      imageUrl: dto.imageUrl,
      sentiment: dto.sentiment,
      toolsUsed: dto.toolsUsed,
    });

    return this.repository.save(conversation);
  }

  /**
   * Add both user message and assistant response at once
   */
  async addExchange(
    conversationId: string,
    userMessage: AddMessageDto,
    assistantMessage: AddMessageDto,
  ): Promise<ChatConversationEntity> {
    const conversation = await this.repository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    // Add user message
    conversation.addMessage(userMessage.role, userMessage.content, {
      imageUrl: userMessage.imageUrl,
      sentiment: userMessage.sentiment,
      toolsUsed: userMessage.toolsUsed,
    });

    // Add assistant response
    conversation.addMessage(assistantMessage.role, assistantMessage.content, {
      sentiment: assistantMessage.sentiment,
      toolsUsed: assistantMessage.toolsUsed,
    });

    return this.repository.save(conversation);
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(
    id: string,
  ): Promise<ChatConversationEntity | null> {
    return this.repository.findById(id);
  }

  /**
   * Get conversation by session ID
   */
  async getConversationBySessionId(
    sessionId: string,
  ): Promise<ChatConversationEntity | null> {
    return this.repository.findBySessionId(sessionId);
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ data: ChatConversationEntity[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findByUserId(userId, { limit, offset }),
      this.repository.countByUserId(userId),
    ]);

    return { data, total };
  }

  /**
   * Search conversations with filters
   */
  async searchConversations(
    options: ConversationQueryOptions,
  ): Promise<{ data: ChatConversationEntity[]; total: number }> {
    return this.repository.findMany(options);
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string, userId?: string): Promise<void> {
    const conversation = await this.repository.findById(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Verify ownership if userId provided
    if (userId && conversation.userId !== userId) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    await this.repository.delete(id);
    this.logger.debug(`Deleted conversation: ${id}`);
  }

  /**
   * Update conversation metadata
   */
  async updateMetadata(
    id: string,
    metadata: Record<string, unknown>,
  ): Promise<ChatConversationEntity> {
    const conversation = await this.repository.findById(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    conversation.updateMetadata(metadata);
    return this.repository.save(conversation);
  }
}
