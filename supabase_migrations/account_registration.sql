-- Accounts registry: enforces "one Student ID = one account" and lets the
-- portal detect whether an email is already registered.
-- Run in the Supabase SQL editor (postgres role). Idempotent.

create table if not exists public.student_accounts (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  user_id uuid unique,
  created_at timestamptz not null default now()
);

alter table public.student_accounts enable row level security;

-- End users never touch this table directly — only via the RPCs below.
create policy "student_accounts no select"
  on public.student_accounts for select using (false);
create policy "student_accounts no insert"
  on public.student_accounts for insert with check (false);
create policy "student_accounts no update"
  on public.student_accounts for update using (false);
create policy "student_accounts no delete"
  on public.student_accounts for delete using (false);

create or replace function public.is_student_id_taken(p_student_id text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.student_accounts where student_id = p_student_id);
$$;

create or replace function public.register_student_account(p_student_id text, p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.student_accounts (student_id, user_id)
  values (p_student_id, p_user_id)
  on conflict (student_id) do nothing;
$$;

create or replace function public.email_registered(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from auth.users where lower(email) = lower(p_email));
$$;