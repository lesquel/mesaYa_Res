-- Chat Conversations Table Migration
-- This table stores chat conversation history with the AI assistant

CREATE TABLE IF NOT EXISTS chat_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    session_id VARCHAR(100) NOT NULL,
    access_level VARCHAR(20) NOT NULL DEFAULT 'guest',
    language VARCHAR(5) NOT NULL DEFAULT 'es',
    restaurant_id UUID NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_created ON chat_conversations(user_id, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE chat_conversations IS 'Stores chat conversation history with the AI assistant';
COMMENT ON COLUMN chat_conversations.conversation_id IS 'Unique conversation identifier';
COMMENT ON COLUMN chat_conversations.user_id IS 'User ID if authenticated, null for guests';
COMMENT ON COLUMN chat_conversations.session_id IS 'Frontend session identifier for conversation continuity';
COMMENT ON COLUMN chat_conversations.access_level IS 'User access level: guest, user, owner, admin';
COMMENT ON COLUMN chat_conversations.language IS 'Conversation language: es, en';
COMMENT ON COLUMN chat_conversations.restaurant_id IS 'Restaurant context for owner conversations';
COMMENT ON COLUMN chat_conversations.messages IS 'JSONB array of conversation messages';
COMMENT ON COLUMN chat_conversations.metadata IS 'Additional metadata (analytics, context, etc)';
