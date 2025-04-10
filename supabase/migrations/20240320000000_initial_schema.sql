-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    fract_tokens INTEGER DEFAULT 33,
    tokens_used INTEGER DEFAULT 0,
    token_balance INTEGER DEFAULT 33,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    last_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create chat_history table
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('USE', 'PURCHASE', 'REFUND')),
    amount INTEGER NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users table policies
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Chats table policies
CREATE POLICY "Users can CRUD own chats" ON chats
    FOR ALL USING (auth.uid() = user_id);

-- Messages table policies
CREATE POLICY "Users can CRUD messages in own chats" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
        )
    );

-- Chat history policies
CREATE POLICY "Users can CRUD own chat history" ON chat_history
    FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can read own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Functions

-- Function to create chat history
CREATE OR REPLACE FUNCTION create_chat_history_table()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chat_history (user_id, title, messages)
    VALUES (NEW.user_id, NEW.title, '[]'::jsonb);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use tokens
CREATE OR REPLACE FUNCTION use_tokens(p_user_id UUID, p_amount INTEGER, p_description TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT token_balance INTO v_current_balance
    FROM users
    WHERE id = p_user_id;

    -- Check if enough tokens
    IF v_current_balance >= p_amount THEN
        -- Update user balance
        UPDATE users
        SET token_balance = token_balance - p_amount,
            tokens_used = tokens_used + p_amount,
            updated_at = NOW()
        WHERE id = p_user_id;

        -- Record transaction
        INSERT INTO transactions (user_id, type, amount, description, status)
        VALUES (p_user_id, 'USE', p_amount, p_description, 'COMPLETED');

        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER create_chat_history_on_chat_insert
    AFTER INSERT ON chats
    FOR EACH ROW
    EXECUTE FUNCTION create_chat_history_table(); 