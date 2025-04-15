-- Function to create chat history table
CREATE OR REPLACE FUNCTION public.create_chat_history_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS chat_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id),
    title text NOT NULL,
    messages jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
END;
$$;

-- Function to use tokens
CREATE OR REPLACE FUNCTION public.use_tokens(p_user_id uuid, p_amount integer, p_description text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance integer;
BEGIN
  -- Get current token balance
  SELECT token_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user has enough tokens
  IF v_current_balance < p_amount THEN
    RETURN false;
  END IF;

  -- Update user's token balance
  UPDATE users
  SET token_balance = token_balance - p_amount
  WHERE id = p_user_id;

  -- Record the transaction
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'USE',
    p_amount,
    p_description,
    'COMPLETED'
  );

  RETURN true;
END;
$$; 