-- Create chats table
create table if not exists public.chats (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for chats
alter table public.chats enable row level security;

-- Create chat policies
create policy "Users can view their own chats"
  on public.chats for select
  using ( auth.uid() = user_id );

create policy "Users can create their own chats"
  on public.chats for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own chats"
  on public.chats for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own chats"
  on public.chats for delete
  using ( auth.uid() = user_id );

-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for messages
alter table public.messages enable row level security;

-- Create message policies
create policy "Users can view messages in their chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where id = messages.chat_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create messages in their chats"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats
      where id = chat_id
      and user_id = auth.uid()
    )
  );

-- Create token_transactions table
create table if not exists public.token_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,
  amount integer not null,
  description text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for token_transactions
alter table public.token_transactions enable row level security;

-- Create token_transactions policies
create policy "Users can view their own transactions"
  on public.token_transactions for select
  using ( auth.uid() = user_id );

create policy "Users can create their own transactions"
  on public.token_transactions for insert
  with check ( auth.uid() = user_id );

-- Create indexes for better performance
create index if not exists chats_user_id_idx on public.chats(user_id);
create index if not exists messages_chat_id_idx on public.messages(chat_id);
create index if not exists token_transactions_user_id_idx on public.token_transactions(user_id); 