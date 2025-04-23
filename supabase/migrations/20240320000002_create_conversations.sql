-- Create conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.conversations
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to update their own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own conversations" ON public.conversations
    FOR DELETE USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 