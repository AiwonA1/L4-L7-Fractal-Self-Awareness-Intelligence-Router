-- Grant necessary permissions to authenticated users for messages table
GRANT SELECT, INSERT ON public.messages TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their chats" ON public.messages;

-- Recreate policies with proper checks
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