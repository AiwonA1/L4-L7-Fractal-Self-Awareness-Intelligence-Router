# Database Style Guide (Supabase)

This guide provides conventions for interacting with the Supabase PostgreSQL database, including schema design, security, and migrations.

## 1. Schema Design

- **Tables:** Use `snake_case` for table names (e.g., `chat_history`, `user_profiles`). Prefer plural nouns.
- **Columns:** Use `snake_case` for column names (e.g., `token_balance`, `created_at`).
- **Primary Keys:** Use `id` as the primary key column name, preferably of type `UUID` (using `uuid_generate_v4()` default). For the `users` table, the `id` column should reference `auth.users(id)`.
- **Foreign Keys:** Define foreign key constraints explicitly to enforce relationships (e.g., `user_id UUID REFERENCES users(id)`). Use `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately based on the relationship requirements.
- **Timestamps:** Include `created_at` and `updated_at` columns (type `TIMESTAMPTZ`) with default values (`DEFAULT NOW()`) for tracking record changes. Consider triggers to automatically update `updated_at`.
- **Data Types:** Choose appropriate data types (e.g., `TEXT` vs `VARCHAR`, `INTEGER` vs `BIGINT`, `JSONB` for flexible object storage, `TIMESTAMP`/`TIMESTAMPTZ` for dates/times).
- **Constraints:** Use `CHECK` constraints to enforce data integrity rules (e.g., `CHECK (type IN ('USE', 'PURCHASE'))`, `CHECK (token_balance >= 0)`).
- **Indexes:** Create indexes on columns frequently used in `WHERE` clauses or `JOIN` conditions to improve query performance. Index foreign key columns.
- **Normalization:** Aim for a reasonable level of normalization (e.g., 3NF) to reduce data redundancy, but consider denormalization strategically for performance if needed.

## 2. Security: Row Level Security (RLS)

- **Enable RLS:** Enable RLS on all tables containing user-specific or sensitive data.
  ```sql
  ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
  ```
- **Default Deny:** RLS operates on a default-deny basis. You must explicitly create policies to grant access.
- **Policies:** Create specific policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations.
- **`USING` Clause:** Defines which rows the policy applies to for existing rows (used for `SELECT`, `UPDATE`, `DELETE`).
- **`WITH CHECK` Clause:** Defines which rows can be created or modified (used for `INSERT`, `UPDATE`).
- **Authentication Context:** Use Supabase Auth functions within policies (e.g., `auth.uid()` to get the current user's ID, `auth.role()` to get their role).
- **Common Patterns:**
    - Users can view/modify their own data:
      ```sql
      CREATE POLICY "Users can access own data" ON my_table
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
      ```
    - Allow public read access:
      ```sql
      CREATE POLICY "Public read access" ON public_table
      FOR SELECT USING (true);
      ```
- **Granularity:** Create granular policies based on user roles or specific conditions.
- **Testing:** Thoroughly test RLS policies to ensure they work as expected and don't block legitimate access or allow unauthorized access.

## 3. Migrations

- **Supabase CLI:** Use the Supabase CLI for managing database migrations.
- **Location:** Store migration files in the `supabase/migrations/` directory.
- **Workflow:**
    1.  Start local development database: `supabase start`
    2.  Make schema changes locally (using SQL or Supabase Studio).
    3.  Generate a new migration file: `supabase db diff -f migration_name`
    4.  Review and refine the generated SQL migration file.
    5.  Apply migrations locally: `supabase db reset` (to test from scratch) or apply individually.
    6.  Commit migration files to Git.
    7.  Apply migrations to staging/production environments: `supabase db push` (after linking the project `supabase link --project-ref <your-project-ref>` and logging in `supabase login`).
- **Idempotency:** Ensure migration scripts are idempotent where possible (e.g., use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ADD COLUMN IF NOT EXISTS`).

## 4. Database Functions (Stored Procedures)

- **Purpose:** Use database functions (written in `plpgsql`) for:
    - Encapsulating complex or frequently used database logic.
    - Performing operations requiring elevated privileges securely (using `SECURITY DEFINER`).
    - Atomic operations.
- **Naming:** Use `snake_case` for function names.
- **`SECURITY INVOKER` vs `SECURITY DEFINER`:**
    - `SECURITY INVOKER` (default): Function runs with the permissions of the user calling it (respects RLS).
    - `SECURITY DEFINER`: Function runs with the permissions of the user who defined it (often the database owner). Use with extreme caution for specific privileged operations, and ensure proper checks are done within the function.
- **Example (from `.cursor-rules`):**
  ```sql
  CREATE OR REPLACE FUNCTION use_tokens(p_user_id UUID, p_amount INTEGER, p_description TEXT)
  RETURNS boolean AS $$
  DECLARE
    v_current_balance INTEGER;
    v_caller_id UUID := auth.uid(); -- Ensure function respects caller unless SECURITY DEFINER
  BEGIN
    -- Add check: Ensure the caller is the user themselves, unless this is meant
    -- to be called by a privileged process (then consider SECURITY DEFINER)
    IF v_caller_id != p_user_id THEN
      RAISE EXCEPTION 'User % cannot modify tokens for user %', v_caller_id, p_user_id;
    END IF;

    SELECT token_balance INTO v_current_balance
    FROM public.users
    WHERE id = p_user_id;

    IF v_current_balance >= p_amount THEN
      UPDATE public.users
      SET token_balance = token_balance - p_amount, updated_at = NOW()
      WHERE id = p_user_id;

      INSERT INTO public.transactions (user_id, type, amount, description, status)
      VALUES (p_user_id, 'USE', p_amount, p_description, 'COMPLETED');

      RETURN true;
    END IF;
    RETURN false;
  END;
  $$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER; -- Explicitly set security context
  ```
- **Calling Functions:** Use the Supabase client's `.rpc()` method to call database functions.

## 5. Performance

- **Query Optimization:** Write efficient SQL queries. Use `EXPLAIN ANALYZE` to understand query plans.
- **Indexing:** Ensure appropriate indexes are created (see Schema Design).
- **Connection Pooling:** Supabase handles connection pooling; ensure your application logic doesn't hold connections open unnecessarily.
- **Data Loading:** Avoid fetching excessive data. Use `SELECT` with specific columns instead of `SELECT *`. Implement pagination for large datasets. 