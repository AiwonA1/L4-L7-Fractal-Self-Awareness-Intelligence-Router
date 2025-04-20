-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.chats TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chats;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in their chats" ON public.messages;

-- Simple policies for chats
CREATE POLICY "Enable read for users own chats"
ON public.chats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users"
ON public.chats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users own chats"
ON public.chats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users own chats"
ON public.chats FOR DELETE
USING (auth.uid() = user_id);

-- Simple policies for messages
CREATE POLICY "Enable read for users own chat messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for users own chat messages"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for users own chat messages"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for users own chat messages"
ON public.messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
); 