/**
 * ChatConversation Domain Entity
 *
 * Represents a chat conversation with the AI assistant.
 * Stores the full conversation history for persistence and analysis.
 */

import { randomUUID } from 'node:crypto';
import type { ChatAccessLevel, ChatLanguage } from '../chatbot.dto';

/**
 * Individual message in a conversation
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
  };
  toolsUsed?: string[];
}

/**
 * Props for creating a new conversation
 */
export interface CreateConversationProps {
  userId?: string;
  sessionId: string;
  accessLevel: ChatAccessLevel;
  language: ChatLanguage;
  restaurantId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Props for a conversation
 */
export interface ConversationProps {
  userId: string | null;
  sessionId: string;
  accessLevel: ChatAccessLevel;
  language: ChatLanguage;
  restaurantId: string | null;
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Snapshot for persistence
 */
export interface ConversationSnapshot {
  id: string;
  userId: string | null;
  sessionId: string;
  accessLevel: ChatAccessLevel;
  language: ChatLanguage;
  restaurantId: string | null;
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ChatConversation Domain Entity
 */
export class ChatConversationEntity {
  private constructor(
    private readonly _id: string,
    private props: ConversationProps,
  ) {}

  /**
   * Create a new conversation
   */
  static create(
    createProps: CreateConversationProps,
    id: string = randomUUID(),
  ): ChatConversationEntity {
    const now = new Date();

    const props: ConversationProps = {
      userId: createProps.userId ?? null,
      sessionId: createProps.sessionId,
      accessLevel: createProps.accessLevel,
      language: createProps.language,
      restaurantId: createProps.restaurantId ?? null,
      messages: [],
      metadata: createProps.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };

    return new ChatConversationEntity(id, props);
  }

  /**
   * Rehydrate from persistence
   */
  static rehydrate(snapshot: ConversationSnapshot): ChatConversationEntity {
    const props: ConversationProps = {
      userId: snapshot.userId,
      sessionId: snapshot.sessionId,
      accessLevel: snapshot.accessLevel,
      language: snapshot.language,
      restaurantId: snapshot.restaurantId,
      messages: snapshot.messages,
      metadata: snapshot.metadata,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };

    return new ChatConversationEntity(snapshot.id, props);
  }

  /**
   * Add a message to the conversation
   */
  addMessage(
    role: 'user' | 'assistant',
    content: string,
    options?: {
      imageUrl?: string;
      sentiment?: { label: 'positive' | 'negative' | 'neutral'; score: number };
      toolsUsed?: string[];
    },
  ): void {
    this.props.messages.push({
      role,
      content,
      timestamp: new Date(),
      imageUrl: options?.imageUrl,
      sentiment: options?.sentiment,
      toolsUsed: options?.toolsUsed,
    });
    this.props.updatedAt = new Date();
  }

  /**
   * Update metadata
   */
  updateMetadata(metadata: Record<string, unknown>): void {
    this.props.metadata = { ...this.props.metadata, ...metadata };
    this.props.updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get userId(): string | null {
    return this.props.userId;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get accessLevel(): ChatAccessLevel {
    return this.props.accessLevel;
  }

  get language(): ChatLanguage {
    return this.props.language;
  }

  get restaurantId(): string | null {
    return this.props.restaurantId;
  }

  get messages(): ChatMessage[] {
    return [...this.props.messages];
  }

  get messageCount(): number {
    return this.props.messages.length;
  }

  get metadata(): Record<string, unknown> {
    return { ...this.props.metadata };
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Get the last user message
   */
  get lastUserMessage(): ChatMessage | null {
    const userMessages = this.props.messages.filter((m) => m.role === 'user');
    return userMessages.length > 0
      ? userMessages[userMessages.length - 1]
      : null;
  }

  /**
   * Get the last assistant message
   */
  get lastAssistantMessage(): ChatMessage | null {
    const assistantMessages = this.props.messages.filter(
      (m) => m.role === 'assistant',
    );
    return assistantMessages.length > 0
      ? assistantMessages[assistantMessages.length - 1]
      : null;
  }

  /**
   * Create a snapshot for persistence
   */
  toSnapshot(): ConversationSnapshot {
    return {
      id: this._id,
      userId: this.props.userId,
      sessionId: this.props.sessionId,
      accessLevel: this.props.accessLevel,
      language: this.props.language,
      restaurantId: this.props.restaurantId,
      messages: [...this.props.messages],
      metadata: { ...this.props.metadata },
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
