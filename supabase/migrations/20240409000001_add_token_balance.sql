-- Add token_balance column to users table with default value of 33
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS token_balance integer DEFAULT 33;

-- Update existing users to have the default token balance if they don't have one
UPDATE public.users 
SET token_balance = 33 
WHERE token_balance IS NULL; 