drop trigger if exists "set_updated_at" on "public"."conversations";

drop trigger if exists "set_updated_at" on "public"."messages";

drop policy "Allow authenticated users to create conversations" on "public"."conversations";

drop policy "Allow public read access" on "public"."conversations";

drop policy "Allow users to delete their own conversations" on "public"."conversations";

drop policy "Allow users to update their own conversations" on "public"."conversations";

drop policy "Allow authenticated users to create messages" on "public"."messages";

drop policy "Allow public read access" on "public"."messages";

drop policy "Allow users to delete their own messages" on "public"."messages";

drop policy "Allow users to update their own messages" on "public"."messages";

drop policy "Public profiles are viewable by everyone." on "public"."profiles";

drop policy "Users can insert their own profile." on "public"."profiles";

drop policy "Users can update their own profile." on "public"."profiles";

revoke delete on table "public"."conversations" from "anon";

revoke insert on table "public"."conversations" from "anon";

revoke references on table "public"."conversations" from "anon";

revoke select on table "public"."conversations" from "anon";

revoke trigger on table "public"."conversations" from "anon";

revoke truncate on table "public"."conversations" from "anon";

revoke update on table "public"."conversations" from "anon";

revoke delete on table "public"."conversations" from "authenticated";

revoke insert on table "public"."conversations" from "authenticated";

revoke references on table "public"."conversations" from "authenticated";

revoke select on table "public"."conversations" from "authenticated";

revoke trigger on table "public"."conversations" from "authenticated";

revoke truncate on table "public"."conversations" from "authenticated";

revoke update on table "public"."conversations" from "authenticated";

revoke delete on table "public"."conversations" from "service_role";

revoke insert on table "public"."conversations" from "service_role";

revoke references on table "public"."conversations" from "service_role";

revoke select on table "public"."conversations" from "service_role";

revoke trigger on table "public"."conversations" from "service_role";

revoke truncate on table "public"."conversations" from "service_role";

revoke update on table "public"."conversations" from "service_role";

revoke delete on table "public"."messages" from "anon";

revoke insert on table "public"."messages" from "anon";

revoke references on table "public"."messages" from "anon";

revoke select on table "public"."messages" from "anon";

revoke trigger on table "public"."messages" from "anon";

revoke truncate on table "public"."messages" from "anon";

revoke update on table "public"."messages" from "anon";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

alter table "public"."conversations" drop constraint "conversations_created_by_fkey";

alter table "public"."messages" drop constraint "messages_conversation_id_fkey";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

drop function if exists "public"."create_chat_history_table"();

drop function if exists "public"."set_updated_at"();

alter table "public"."conversations" drop constraint "conversations_pkey";

alter table "public"."profiles" drop constraint "profiles_pkey";

drop index if exists "public"."conversations_pkey";

drop index if exists "public"."profiles_pkey";

drop table "public"."conversations";

drop table "public"."profiles";

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


create table "public"."chats" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "title" text not null,
    "last_message" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."chats" enable row level security;

create table "public"."transactions" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "type" text not null,
    "amount" integer not null,
    "description" text not null,
    "status" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."transactions" enable row level security;

create table "public"."users" (
    "id" uuid not null default uuid_generate_v4(),
    "email" text not null,
    "name" text,
    "fract_tokens" integer default 33,
    "tokens_used" integer default 0,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "password" text,
    "token_balance" integer default 33
);


alter table "public"."users" enable row level security;

alter table "public"."messages" drop column "conversation_id";

alter table "public"."messages" drop column "metadata";

alter table "public"."messages" drop column "tokens";

alter table "public"."messages" drop column "updated_at";

alter table "public"."messages" add column "chat_id" uuid not null;

alter table "public"."messages" alter column "created_at" set default now();

alter table "public"."messages" alter column "role" set data type text using "role"::text;

drop type "public"."message_role";

CREATE UNIQUE INDEX _prisma_migrations_pkey ON public._prisma_migrations USING btree (id);

CREATE UNIQUE INDEX chats_pkey ON public.chats USING btree (id);

CREATE INDEX idx_chats_user_id ON public.chats USING btree (user_id);

CREATE INDEX idx_messages_chat_id ON public.messages USING btree (chat_id);

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE INDEX idx_users_fract_tokens ON public.users USING btree (fract_tokens);

CREATE INDEX idx_users_token_balance ON public.users USING btree (token_balance);

CREATE INDEX idx_users_tokens_used ON public.users USING btree (tokens_used);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."_prisma_migrations" add constraint "_prisma_migrations_pkey" PRIMARY KEY using index "_prisma_migrations_pkey";

alter table "public"."chats" add constraint "chats_pkey" PRIMARY KEY using index "chats_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."chats" add constraint "chats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_user_id_fkey";

alter table "public"."messages" add constraint "messages_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_chat_id_fkey";

alter table "public"."messages" add constraint "messages_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text]))) not valid;

alter table "public"."messages" validate constraint "messages_role_check";

alter table "public"."transactions" add constraint "transactions_status_check" CHECK ((status = ANY (ARRAY['COMPLETED'::text, 'PENDING'::text, 'FAILED'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_status_check";

alter table "public"."transactions" add constraint "transactions_type_check" CHECK ((type = ANY (ARRAY['USE'::text, 'PURCHASE'::text, 'REFUND'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_type_check";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_tokens(p_user_id uuid, p_amount integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update balance
  UPDATE public.users
  SET 
    token_balance = COALESCE(token_balance, 0) + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'ADD',
    p_amount,
    'Added tokens to balance',
    'COMPLETED'
  );
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_token_balance(p_user_id uuid, p_required_tokens integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_current_balance integer;
BEGIN
  SELECT token_balance INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_current_balance, 0) >= p_required_tokens;
END;
$function$
;

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

CREATE OR REPLACE FUNCTION public.handle_chat_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF auth.uid() != OLD.user_id THEN
    RAISE EXCEPTION 'Not authorized to update this chat';
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_message_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = OLD.chat_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to delete this message';
  END IF;
  
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.use_tokens(p_user_id uuid, p_amount integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_current_balance integer;
BEGIN
  -- Get current balance
  SELECT token_balance INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id;
  
  -- Check if enough tokens
  IF COALESCE(v_current_balance, 0) >= p_amount THEN
    -- Update balance
    UPDATE public.users
    SET 
      token_balance = token_balance - p_amount,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Record transaction
    INSERT INTO public.transactions (
      user_id,
      type,
      amount,
      description,
      status
    ) VALUES (
      p_user_id,
      'USE',
      p_amount,
      'Used tokens for chat',
      'COMPLETED'
    );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name, token_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    33  -- Default token balance
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."_prisma_migrations" to "service_role";

grant insert on table "public"."_prisma_migrations" to "service_role";

grant references on table "public"."_prisma_migrations" to "service_role";

grant select on table "public"."_prisma_migrations" to "service_role";

grant trigger on table "public"."_prisma_migrations" to "service_role";

grant truncate on table "public"."_prisma_migrations" to "service_role";

grant update on table "public"."_prisma_migrations" to "service_role";

grant delete on table "public"."chats" to "authenticated";

grant insert on table "public"."chats" to "authenticated";

grant references on table "public"."chats" to "authenticated";

grant select on table "public"."chats" to "authenticated";

grant trigger on table "public"."chats" to "authenticated";

grant truncate on table "public"."chats" to "authenticated";

grant update on table "public"."chats" to "authenticated";

grant delete on table "public"."chats" to "service_role";

grant insert on table "public"."chats" to "service_role";

grant references on table "public"."chats" to "service_role";

grant select on table "public"."chats" to "service_role";

grant trigger on table "public"."chats" to "service_role";

grant truncate on table "public"."chats" to "service_role";

grant update on table "public"."chats" to "service_role";

grant insert on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Allow authenticated users to delete their own chats"
on "public"."chats"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Enable insert access for authenticated users"
on "public"."chats"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Enable read access for authenticated users"
on "public"."chats"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Enable update access for authenticated users"
on "public"."chats"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can CRUD their own chats"
on "public"."chats"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own chats"
on "public"."chats"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own chats"
on "public"."chats"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "authenticated_users_all"
on "public"."chats"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Enable delete access for chat participants"
on "public"."messages"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))));


create policy "Enable insert access for chat participants"
on "public"."messages"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))));


create policy "Enable read access for chat participants"
on "public"."messages"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))));


create policy "Enable update access for chat participants"
on "public"."messages"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))));


create policy "Users can CRUD messages in their chats"
on "public"."messages"
as permissive
for all
to public
using ((auth.uid() = ( SELECT chats.user_id
   FROM chats
  WHERE (chats.id = messages.chat_id))));


create policy "Users can delete their own messages"
on "public"."messages"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))));


create policy "authenticated_users_all"
on "public"."messages"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM chats
  WHERE ((chats.id = messages.chat_id) AND (chats.user_id = auth.uid())))));


create policy "Users can create own transactions"
on "public"."transactions"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can read own transactions"
on "public"."transactions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can read their own transactions"
on "public"."transactions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can read own data"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can read own token data"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can update own data"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can update own token data"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


CREATE TRIGGER chat_update_trigger BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION handle_chat_update();


