-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can read own chats" ON public.chat_history;
DROP POLICY IF EXISTS "Users can create own chats" ON public.chat_history;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chat_history;
DROP POLICY IF EXISTS "Users can delete own chats" ON public.chat_history;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data"
ON public.users FOR SELECT
USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE
USING (auth.uid()::uuid = id);

-- Chat history policies
CREATE POLICY "Users can read own chats"
ON public.chat_history FOR SELECT
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own chats"
ON public.chat_history FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own chats"
ON public.chat_history FOR UPDATE
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own chats"
ON public.chat_history FOR DELETE
USING (auth.uid()::uuid = user_id);

-- Transactions policies
CREATE POLICY "Users can read own transactions"
ON public.transactions FOR SELECT
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id);

-- Grant appropriate permissions to authenticated users
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_history TO authenticated;
GRANT SELECT, INSERT ON public.transactions TO authenticated; 