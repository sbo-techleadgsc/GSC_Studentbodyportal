-- Backfill student_accounts from existing Supabase users' metadata.
-- Run AFTER account_registration.sql. Idempotent.

insert into public.student_accounts (student_id, user_id)
select
  (u.raw_user_meta_data ->> 'student_id') as student_id,
  u.id as user_id
from auth.users u
where (u.raw_user_meta_data ->> 'student_id') is not null
  and (u.raw_user_meta_data ->> 'student_id') <> ''
on conflict (student_id) do nothing;