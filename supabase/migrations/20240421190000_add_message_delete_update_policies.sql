-- Add RLS policies for UPDATE and DELETE on the messages table

-- Ensure RLS is enabled (might be redundant if already enabled, but safe)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to UPDATE messages in chats they own
CREATE POLICY "Enable update access for chat participants"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
);

-- Policy to allow users to DELETE messages in chats they own
CREATE POLICY "Enable delete access for chat participants"
ON public.messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = messages.chat_id
    AND user_id = auth.uid()
  )
); 