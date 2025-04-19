-- Remove trigger and function that creates chat_history entries
DROP TRIGGER IF EXISTS create_chat_history_on_chat_insert ON chats;
DROP FUNCTION IF EXISTS create_chat_history_table();

-- Remove RLS policies for chat_history
DROP POLICY IF EXISTS "Users can CRUD own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can read own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can create own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can update own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can delete own chat history" ON chat_history;

-- Remove indexes on chat_history
DROP INDEX IF EXISTS idx_chat_history_user_id;
DROP INDEX IF EXISTS idx_chat_history_created_at;

-- Remove grants from chat_history
REVOKE ALL ON chat_history FROM authenticated;
REVOKE ALL ON chat_history FROM anon;

-- Drop the chat_history table
DROP TABLE IF EXISTS chat_history; 