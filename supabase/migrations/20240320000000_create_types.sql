-- Create custom types and enums
CREATE TYPE public.message_role AS ENUM ('user', 'assistant', 'system');

-- Create set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create any additional types or enums here if needed in the future 