-- Drop all existing user policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create standardized policies with type-safe checks
CREATE POLICY "Users can read own data"
ON public.users FOR SELECT
USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE
USING (auth.uid()::uuid = id);

-- Ensure proper grants
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_users_token_balance ON public.users(token_balance);
CREATE INDEX IF NOT EXISTS idx_users_fract_tokens ON public.users(fract_tokens);
CREATE INDEX IF NOT EXISTS idx_users_tokens_used ON public.users(tokens_used); 