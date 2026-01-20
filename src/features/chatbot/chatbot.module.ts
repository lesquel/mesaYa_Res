/**
 * Chatbot Module - Integration with MesaYa Chatbot Microservice
 *
 * This module provides a clean integration layer between the NestJS backend
 * and the Python-based chatbot microservice, plus chat history persistence.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatbotController } from './interface/chatbot.controller';
import { ChatConversationController } from './interface/chat-conversation.controller';
import { ChatbotService } from './application/chatbot.service';
import { ChatConversationService } from './application/chat-conversation.service';
import { CHATBOT_SERVICE } from './chatbot.tokens';
import { CHAT_CONVERSATION_REPOSITORY } from './application/ports';
import { ChatConversationOrmEntity } from './infrastructure/database/orm';
import { TypeOrmChatConversationRepository } from './infrastructure/database/repositories';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ChatConversationOrmEntity]),
  ],
  controllers: [ChatbotController, ChatConversationController],
  providers: [
    {
      provide: CHATBOT_SERVICE,
      useClass: ChatbotService,
    },
    {
      provide: CHAT_CONVERSATION_REPOSITORY,
      useClass: TypeOrmChatConversationRepository,
    },
    ChatConversationService,
  ],
  exports: [
    CHATBOT_SERVICE,
    CHAT_CONVERSATION_REPOSITORY,
    ChatConversationService,
  ],
})
export class ChatbotModule {}
