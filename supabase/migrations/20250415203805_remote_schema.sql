drop trigger if exists "create_chat_history_on_chat_insert" on "public"."chats";

drop policy "Users can CRUD own chat history" on "public"."chat_history";

drop policy "Users can CRUD own chats" on "public"."chats";

drop policy "Users can create their own chats" on "public"."chats";

drop policy "Users can delete their own chats" on "public"."chats";

drop policy "Users can update their own chats" on "public"."chats";

drop policy "Users can view their own chats" on "public"."chats";

drop policy "Users can CRUD messages in own chats" on "public"."messages";

drop policy "Users can create messages in their chats" on "public"."messages";

drop policy "Users can view messages in their chats" on "public"."messages";

drop policy "Users can create their own transactions" on "public"."token_transactions";

drop policy "Users can view their own transactions" on "public"."token_transactions";

drop policy "Users can read own transactions" on "public"."transactions";

drop policy "Users can read own data" on "public"."users";

revoke delete on table "public"."chat_history" from "anon";

revoke insert on table "public"."chat_history" from "anon";

revoke references on table "public"."chat_history" from "anon";

revoke select on table "public"."chat_history" from "anon";

revoke trigger on table "public"."chat_history" from "anon";

revoke truncate on table "public"."chat_history" from "anon";

revoke update on table "public"."chat_history" from "anon";

revoke delete on table "public"."chat_history" from "authenticated";

revoke insert on table "public"."chat_history" from "authenticated";

revoke references on table "public"."chat_history" from "authenticated";

revoke select on table "public"."chat_history" from "authenticated";

revoke trigger on table "public"."chat_history" from "authenticated";

revoke truncate on table "public"."chat_history" from "authenticated";

revoke update on table "public"."chat_history" from "authenticated";

revoke delete on table "public"."chats" from "anon";

revoke insert on table "public"."chats" from "anon";

revoke references on table "public"."chats" from "anon";

revoke select on table "public"."chats" from "anon";

revoke trigger on table "public"."chats" from "anon";

revoke truncate on table "public"."chats" from "anon";

revoke update on table "public"."chats" from "anon";

revoke delete on table "public"."chats" from "authenticated";

revoke insert on table "public"."chats" from "authenticated";

revoke references on table "public"."chats" from "authenticated";

revoke select on table "public"."chats" from "authenticated";

revoke trigger on table "public"."chats" from "authenticated";

revoke truncate on table "public"."chats" from "authenticated";

revoke update on table "public"."chats" from "authenticated";

revoke delete on table "public"."messages" from "anon";

revoke insert on table "public"."messages" from "anon";

revoke references on table "public"."messages" from "anon";

revoke select on table "public"."messages" from "anon";

revoke trigger on table "public"."messages" from "anon";

revoke truncate on table "public"."messages" from "anon";

revoke update on table "public"."messages" from "anon";

revoke delete on table "public"."messages" from "authenticated";

revoke insert on table "public"."messages" from "authenticated";

revoke references on table "public"."messages" from "authenticated";

revoke select on table "public"."messages" from "authenticated";

revoke trigger on table "public"."messages" from "authenticated";

revoke truncate on table "public"."messages" from "authenticated";

revoke update on table "public"."messages" from "authenticated";

revoke delete on table "public"."token_transactions" from "anon";

revoke insert on table "public"."token_transactions" from "anon";

revoke references on table "public"."token_transactions" from "anon";

revoke select on table "public"."token_transactions" from "anon";

revoke trigger on table "public"."token_transactions" from "anon";

revoke truncate on table "public"."token_transactions" from "anon";

revoke update on table "public"."token_transactions" from "anon";

revoke delete on table "public"."token_transactions" from "authenticated";

revoke insert on table "public"."token_transactions" from "authenticated";

revoke references on table "public"."token_transactions" from "authenticated";

revoke select on table "public"."token_transactions" from "authenticated";

revoke trigger on table "public"."token_transactions" from "authenticated";

revoke truncate on table "public"."token_transactions" from "authenticated";

revoke update on table "public"."token_transactions" from "authenticated";

revoke delete on table "public"."token_transactions" from "service_role";

revoke insert on table "public"."token_transactions" from "service_role";

revoke references on table "public"."token_transactions" from "service_role";

revoke select on table "public"."token_transactions" from "service_role";

revoke trigger on table "public"."token_transactions" from "service_role";

revoke truncate on table "public"."token_transactions" from "service_role";

revoke update on table "public"."token_transactions" from "service_role";

revoke delete on table "public"."transactions" from "anon";

revoke insert on table "public"."transactions" from "anon";

revoke references on table "public"."transactions" from "anon";

revoke select on table "public"."transactions" from "anon";

revoke trigger on table "public"."transactions" from "anon";

revoke truncate on table "public"."transactions" from "anon";

revoke update on table "public"."transactions" from "anon";

revoke delete on table "public"."transactions" from "authenticated";

revoke insert on table "public"."transactions" from "authenticated";

revoke references on table "public"."transactions" from "authenticated";

revoke select on table "public"."transactions" from "authenticated";

revoke trigger on table "public"."transactions" from "authenticated";

revoke truncate on table "public"."transactions" from "authenticated";

revoke update on table "public"."transactions" from "authenticated";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

alter table "public"."token_transactions" drop constraint "token_transactions_user_id_fkey";

alter table "public"."token_transactions" drop constraint "token_transactions_pkey";

drop index if exists "public"."chats_user_id_idx";

drop index if exists "public"."messages_chat_id_idx";

drop index if exists "public"."token_transactions_pkey";

drop index if exists "public"."token_transactions_user_id_idx";

drop table "public"."token_transactions";

create table "public"."_prisma_migrations" (
    "id" character varying(36) not null,
    "checksum" character varying(64) not null,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) not null,
    "logs" text,
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone not null default now(),
    "applied_steps_count" integer not null default 0
);


alter table "public"."chats" alter column "created_at" set default now();

alter table "public"."chats" alter column "created_at" set not null;

alter table "public"."chats" alter column "updated_at" set default now();

alter table "public"."chats" alter column "updated_at" set not null;

alter table "public"."chats" alter column "user_id" set not null;

alter table "public"."messages" alter column "chat_id" set not null;

alter table "public"."messages" alter column "created_at" set default now();

alter table "public"."messages" alter column "created_at" set not null;

alter table "public"."messages" alter column "role" set not null;

alter table "public"."transactions" alter column "created_at" set default now();

alter table "public"."transactions" alter column "created_at" set not null;

alter table "public"."transactions" alter column "description" set not null;

alter table "public"."transactions" alter column "status" set not null;

alter table "public"."transactions" alter column "type" set not null;

alter table "public"."transactions" alter column "updated_at" set default now();

alter table "public"."transactions" alter column "updated_at" set not null;

alter table "public"."transactions" alter column "user_id" set not null;

CREATE UNIQUE INDEX _prisma_migrations_pkey ON public._prisma_migrations USING btree (id);

CREATE INDEX idx_chat_history_created_at ON public.chat_history USING btree (created_at);

CREATE INDEX idx_chat_history_user_id ON public.chat_history USING btree (user_id);

CREATE INDEX idx_users_email ON public.users USING btree (email);

alter table "public"."_prisma_migrations" add constraint "_prisma_migrations_pkey" PRIMARY KEY using index "_prisma_migrations_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_profiles_table()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    fract_tokens INTEGER DEFAULT 33,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

  -- Enable RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- Create policies
  CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_chat_history_table()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

  -- Enable RLS
  ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

  -- Create policies
  CREATE POLICY "Users can manage own chats"
    ON chat_history FOR ALL
    USING (auth.uid() = user_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.use_tokens(p_user_id uuid, p_amount integer, p_description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_current_balance integer;
begin
    -- Get current balance
    select token_balance into v_current_balance
    from public.users
    where id = p_user_id;

    -- Check if user has enough tokens
    if v_current_balance >= p_amount then
        -- Update user's balance
        update public.users
        set token_balance = token_balance - p_amount
        where id = p_user_id;

        -- Create transaction record
        insert into public.transactions (
            user_id,
            type,
            amount,
            description,
            status
        ) values (
            p_user_id,
            'USE',
            p_amount,
            p_description,
            'COMPLETED'
        );

        return true;
    else
        return false;
    end if;
end;
$function$
;

grant delete on table "public"."_prisma_migrations" to "service_role";

grant insert on table "public"."_prisma_migrations" to "service_role";

grant references on table "public"."_prisma_migrations" to "service_role";

grant select on table "public"."_prisma_migrations" to "service_role";

grant trigger on table "public"."_prisma_migrations" to "service_role";

grant truncate on table "public"."_prisma_migrations" to "service_role";

grant update on table "public"."_prisma_migrations" to "service_role";

create policy "Users can manage own chats"
on "public"."chat_history"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can CRUD their own chats"
on "public"."chats"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can CRUD messages in their chats"
on "public"."messages"
as permissive
for all
to public
using ((auth.uid() = ( SELECT chats.user_id
   FROM chats
  WHERE (chats.id = messages.chat_id))));


create policy "Users can read their own transactions"
on "public"."transactions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can read their own data"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can update their own data"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own data"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



