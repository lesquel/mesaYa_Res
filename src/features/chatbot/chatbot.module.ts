/**
 * Chatbot Module - Integration with MesaYa Chatbot Microservice
 *
 * This module provides a clean integration layer between the NestJS backend
 * and the Python-based chatbot microservice.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatbotController } from './interface/chatbot.controller';
import { ChatbotService } from './application/chatbot.service';
import { CHATBOT_SERVICE } from './chatbot.tokens';

@Module({
  imports: [ConfigModule],
  controllers: [ChatbotController],
  providers: [
    {
      provide: CHATBOT_SERVICE,
      useClass: ChatbotService,
    },
  ],
  exports: [CHATBOT_SERVICE],
})
export class ChatbotModule {}
