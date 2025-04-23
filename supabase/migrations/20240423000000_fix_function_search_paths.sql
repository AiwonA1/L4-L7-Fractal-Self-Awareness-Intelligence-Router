-- Fix function search paths by setting them explicitly
DO $$ 
BEGIN
    -- Check and alter handle_new_user
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
        AND pronargs = 0
    ) THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    END IF;

    -- Check and alter set_updated_at
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'set_updated_at'
        AND pronargs = 0
    ) THEN
        ALTER FUNCTION public.set_updated_at() SET search_path = public;
    END IF;

    -- Check and alter use_tokens
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'use_tokens'
        AND pronargs = 2
    ) THEN
        ALTER FUNCTION public.use_tokens(p_user_id uuid, p_amount integer) SET search_path = public;
    END IF;

    -- Check and alter check_token_balance
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'check_token_balance'
        AND pronargs = 2
    ) THEN
        ALTER FUNCTION public.check_token_balance(p_user_id uuid, p_required_tokens integer) SET search_path = public;
    END IF;

    -- Check and alter add_tokens
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'add_tokens'
        AND pronargs = 2
    ) THEN
        ALTER FUNCTION public.add_tokens(p_user_id uuid, p_amount integer) SET search_path = public;
    END IF;

    -- Check and alter handle_message_delete
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_message_delete'
        AND pronargs = 0
    ) THEN
        ALTER FUNCTION public.handle_message_delete() SET search_path = public;
    END IF;

    -- Check and alter handle_chat_update
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_chat_update'
        AND pronargs = 0
    ) THEN
        ALTER FUNCTION public.handle_chat_update() SET search_path = public;
    END IF;
END $$;

-- All functions now have their search paths explicitly set to public 