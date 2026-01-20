/**
 * ChatConversation TypeORM Entity
 *
 * Database representation of a chat conversation.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Message stored in JSONB column
 */
export interface ChatMessageOrm {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO date string for JSON serialization
  imageUrl?: string;
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
  };
  toolsUsed?: string[];
}

@Entity({ name: 'chat_conversations' })
@Index(['userId', 'createdAt'])
@Index(['sessionId'])
export class ChatConversationOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'conversation_id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  @Index()
  userId: string | null;

  @Column({ type: 'varchar', length: 100, name: 'session_id' })
  sessionId: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'access_level',
    default: 'guest',
  })
  accessLevel: string;

  @Column({
    type: 'varchar',
    length: 5,
    name: 'language',
    default: 'es',
  })
  language: string;

  @Column({ type: 'uuid', name: 'restaurant_id', nullable: true })
  restaurantId: string | null;

  @Column({ type: 'jsonb', name: 'messages', default: [] })
  messages: ChatMessageOrm[];

  @Column({ type: 'jsonb', name: 'metadata', default: {} })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
