/**
 * Chatbot Feature Module - Public API
 */

export { ChatbotModule } from './chatbot.module';
export { CHATBOT_SERVICE } from './chatbot.tokens';
export { ChatbotService } from './application/chatbot.service';
export { ChatRequestDto, ChatResponseDto } from './domain/chatbot.dto';

// Chat Conversation exports
export { ChatConversationService } from './application/chat-conversation.service';
export { CHAT_CONVERSATION_REPOSITORY } from './application/ports';
export {
  ChatConversationEntity,
  type ChatMessage,
  type ConversationSnapshot,
} from './domain/entities';
export { ChatConversationOrmEntity } from './infrastructure/database/orm';
