-- ══════════════════════════════════════════════════════════════
-- REMOVE DEMO / MOCKUP DATA — deletes every row inserted by
-- seed_demo_data.sql (all demo IDs start with 00000000-0000-4000-8000-).
-- Real data and the officers table are untouched.
-- Run in the Supabase SQL editor. Safe to re-run.
-- ══════════════════════════════════════════════════════════════

delete from public.poll_options  where id::text      like '00000000-0000-4000-8000-%';
delete from public.polls         where id::text      like '00000000-0000-4000-8000-%';
delete from public.freedom_wall  where id::text      like '00000000-0000-4000-8000-%';
delete from public.reports       where id::text      like '00000000-0000-4000-8000-%';
delete from public.news          where id::text      like '00000000-0000-4000-8000-%';
delete from public.events        where id::text      like '00000000-0000-4000-8000-%';
delete from public.updates       where id::text      like '00000000-0000-4000-8000-%';
delete from public.budget        where id::text      like '00000000-0000-4000-8000-%';
delete from public.promises      where id::text      like '00000000-0000-4000-8000-%';