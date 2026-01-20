/**
 * TypeORM Chat Conversation Repository
 *
 * Implementation of the chat conversation repository using TypeORM.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ChatConversationOrmEntity,
  ChatMessageOrm,
} from '../orm/chat-conversation.type-orm.entity';
import {
  ChatConversationEntity,
  ChatMessage,
  ConversationSnapshot,
} from '../../../domain/entities';
import {
  IChatConversationRepository,
  ConversationQueryOptions,
} from '../../../application/ports';
import type {
  ChatAccessLevel,
  ChatLanguage,
} from '../../../domain/chatbot.dto';

@Injectable()
export class TypeOrmChatConversationRepository
  implements IChatConversationRepository
{
  constructor(
    @InjectRepository(ChatConversationOrmEntity)
    private readonly ormRepository: Repository<ChatConversationOrmEntity>,
  ) {}

  async save(
    conversation: ChatConversationEntity,
  ): Promise<ChatConversationEntity> {
    const snapshot = conversation.toSnapshot();
    const ormEntity = this.toOrmEntity(snapshot);

    const saved = await this.ormRepository.save(ormEntity);

    return this.toDomainEntity(saved);
  }

  async findById(id: string): Promise<ChatConversationEntity | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomainEntity(entity) : null;
  }

  async findBySessionId(
    sessionId: string,
  ): Promise<ChatConversationEntity | null> {
    const entity = await this.ormRepository.findOne({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });

    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByUserId(
    userId: string,
    options?: Pick<ConversationQueryOptions, 'limit' | 'offset'>,
  ): Promise<ChatConversationEntity[]> {
    const entities = await this.ormRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });

    return entities.map((e) => this.toDomainEntity(e));
  }

  async findMany(
    options: ConversationQueryOptions,
  ): Promise<{ data: ChatConversationEntity[]; total: number }> {
    const queryBuilder = this.ormRepository.createQueryBuilder('conversation');

    // Apply filters
    if (options.userId) {
      queryBuilder.andWhere('conversation.userId = :userId', {
        userId: options.userId,
      });
    }

    if (options.sessionId) {
      queryBuilder.andWhere('conversation.sessionId = :sessionId', {
        sessionId: options.sessionId,
      });
    }

    if (options.accessLevel) {
      queryBuilder.andWhere('conversation.accessLevel = :accessLevel', {
        accessLevel: options.accessLevel,
      });
    }

    if (options.language) {
      queryBuilder.andWhere('conversation.language = :language', {
        language: options.language,
      });
    }

    if (options.restaurantId) {
      queryBuilder.andWhere('conversation.restaurantId = :restaurantId', {
        restaurantId: options.restaurantId,
      });
    }

    if (options.fromDate) {
      queryBuilder.andWhere('conversation.createdAt >= :fromDate', {
        fromDate: options.fromDate,
      });
    }

    if (options.toDate) {
      queryBuilder.andWhere('conversation.createdAt <= :toDate', {
        toDate: options.toDate,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    queryBuilder
      .orderBy('conversation.createdAt', 'DESC')
      .take(options.limit ?? 20)
      .skip(options.offset ?? 0);

    const entities = await queryBuilder.getMany();

    return {
      data: entities.map((e) => this.toDomainEntity(e)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.ormRepository.count({
      where: { userId },
    });
  }

  /**
   * Convert ORM entity to domain entity
   */
  private toDomainEntity(
    orm: ChatConversationOrmEntity,
  ): ChatConversationEntity {
    const snapshot: ConversationSnapshot = {
      id: orm.id,
      userId: orm.userId,
      sessionId: orm.sessionId,
      accessLevel: orm.accessLevel as ChatAccessLevel,
      language: orm.language as ChatLanguage,
      restaurantId: orm.restaurantId,
      messages: orm.messages.map((m) => this.ormMessageToDomain(m)),
      metadata: orm.metadata,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    };

    return ChatConversationEntity.rehydrate(snapshot);
  }

  /**
   * Convert domain entity snapshot to ORM entity
   */
  private toOrmEntity(
    snapshot: ConversationSnapshot,
  ): ChatConversationOrmEntity {
    const orm = new ChatConversationOrmEntity();
    orm.id = snapshot.id;
    orm.userId = snapshot.userId;
    orm.sessionId = snapshot.sessionId;
    orm.accessLevel = snapshot.accessLevel;
    orm.language = snapshot.language;
    orm.restaurantId = snapshot.restaurantId;
    orm.messages = snapshot.messages.map((m) => this.domainMessageToOrm(m));
    orm.metadata = snapshot.metadata;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;
    return orm;
  }

  /**
   * Convert ORM message to domain message
   */
  private ormMessageToDomain(orm: ChatMessageOrm): ChatMessage {
    return {
      role: orm.role,
      content: orm.content,
      timestamp: new Date(orm.timestamp),
      imageUrl: orm.imageUrl,
      sentiment: orm.sentiment,
      toolsUsed: orm.toolsUsed,
    };
  }

  /**
   * Convert domain message to ORM message
   */
  private domainMessageToOrm(domain: ChatMessage): ChatMessageOrm {
    return {
      role: domain.role,
      content: domain.content,
      timestamp: domain.timestamp.toISOString(),
      imageUrl: domain.imageUrl,
      sentiment: domain.sentiment,
      toolsUsed: domain.toolsUsed,
    };
  }
}
