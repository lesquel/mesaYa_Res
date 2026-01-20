/**
 * Chat Conversation Repository Interface
 *
 * Port for chat conversation persistence operations.
 */

import { ChatConversationEntity } from '../../domain/entities';

/**
 * Filter options for querying conversations
 */
export interface ConversationQueryOptions {
  userId?: string;
  sessionId?: string;
  accessLevel?: string;
  language?: string;
  restaurantId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Repository interface for chat conversations
 */
export interface IChatConversationRepository {
  /**
   * Save a conversation (create or update)
   */
  save(conversation: ChatConversationEntity): Promise<ChatConversationEntity>;

  /**
   * Find conversation by ID
   */
  findById(id: string): Promise<ChatConversationEntity | null>;

  /**
   * Find conversation by session ID
   */
  findBySessionId(sessionId: string): Promise<ChatConversationEntity | null>;

  /**
   * Find conversations by user ID
   */
  findByUserId(
    userId: string,
    options?: Pick<ConversationQueryOptions, 'limit' | 'offset'>,
  ): Promise<ChatConversationEntity[]>;

  /**
   * Find conversations with filters
   */
  findMany(
    options: ConversationQueryOptions,
  ): Promise<{ data: ChatConversationEntity[]; total: number }>;

  /**
   * Delete a conversation
   */
  delete(id: string): Promise<void>;

  /**
   * Count conversations for a user
   */
  countByUserId(userId: string): Promise<number>;
}

export const CHAT_CONVERSATION_REPOSITORY = Symbol(
  'CHAT_CONVERSATION_REPOSITORY',
);
