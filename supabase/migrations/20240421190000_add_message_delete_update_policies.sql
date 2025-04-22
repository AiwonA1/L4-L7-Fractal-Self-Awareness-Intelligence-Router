-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;

-- Enable RLS on messages table if not already enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for message deletion
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (
  auth.uid() = user_id
);

-- Enable RLS on chats table if not already enabled
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policy for chat updates
CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
USING (
  auth.uid() = user_id
);

-- Add error handling function
CREATE OR REPLACE FUNCTION public.handle_message_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF auth.uid() != OLD.user_id THEN
    RAISE EXCEPTION 'Not authorized to delete this message';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add error handling function for chat updates
CREATE OR REPLACE FUNCTION public.handle_chat_update()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF auth.uid() != OLD.user_id THEN
    RAISE EXCEPTION 'Not authorized to update this chat';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS message_delete_trigger ON public.messages;
CREATE TRIGGER message_delete_trigger
  BEFORE DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_delete();

DROP TRIGGER IF EXISTS chat_update_trigger ON public.chats;
CREATE TRIGGER chat_update_trigger
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_chat_update(); 