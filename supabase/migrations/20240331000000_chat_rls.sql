-- Enable RLS on tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies for chats table
CREATE POLICY "Users can view their own chats" 
ON chats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" 
ON chats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" 
ON chats FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" 
ON chats FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for chat_history table
CREATE POLICY "Users can view their own chat history" 
ON chat_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own chat history" 
ON chat_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat history" 
ON chat_history FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history" 
ON chat_history FOR DELETE 
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_history TO authenticated; 