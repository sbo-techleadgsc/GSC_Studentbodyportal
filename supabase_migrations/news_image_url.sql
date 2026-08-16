-- Ensure the news table has the image_url column used by the portal.
-- Idempotent — run in the Supabase SQL editor (postgres role).

alter table public.news
  add column if not exists image_url text;