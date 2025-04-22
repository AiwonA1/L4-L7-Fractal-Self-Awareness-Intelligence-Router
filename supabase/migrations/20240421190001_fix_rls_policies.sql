-- Drop existing policies
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chats;

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.chats TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Create policies for chats table
CREATE POLICY "Users can view their own chats"
ON public.chats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
ON public.chats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
ON public.chats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
ON public.chats FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for messages table
CREATE POLICY "Users can view messages in their chats"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their chats"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their chats"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in their chats"
ON public.messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
); 