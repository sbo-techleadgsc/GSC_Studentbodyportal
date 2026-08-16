-- Fix: the reports table in Supabase was created manually with a partial schema and is
-- missing columns the portal writes on submit. All statements are idempotent (IF NOT EXISTS),
-- so this can be re-run safely. Run in the Supabase SQL editor (postgres role).

-- Identity / submission
alter table public.reports
  add column if not exists tracking_code text;

-- Public reporter details (null for anonymous)
alter table public.reports
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists student_id text,
  add column if not exists section text,
  add column if not exists contact_method text,
  add column if not exists contact_value text;

-- Report content
alter table public.reports
  add column if not exists category text,
  add column if not exists content text,
  add column if not exists status text;

-- Moderation
alter table public.reports
  add column if not exists admin_notes text,
  add column if not exists admin_reply text;

-- Flags
alter table public.reports
  add column if not exists is_anonymous boolean not null default false,
  add column if not exists disclaimer_accepted boolean not null default false,
  add column if not exists is_approved boolean not null default false,
  add column if not exists is_shadowbanned boolean not null default false;

-- Timestamps
alter table public.reports
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Constraints: the existing manual table has check constraints that don't cover all
-- statuses the portal uses ('under-review'). Drop and recreate them with the app's values.
alter table public.reports
  drop constraint if exists reports_status_check;

alter table public.reports
  add constraint reports_status_check
  check (status in ('pending', 'under-review', 'resolved', 'rejected'));

alter table public.reports
  drop constraint if exists reports_visibility_check;

alter table public.reports
  add constraint reports_visibility_check
  check (visibility in ('public', 'anonymous'));

alter table public.reports
  drop constraint if exists reports_category_check;

alter table public.reports
  add constraint reports_category_check
  check (category in ('direct-inquiry', 'lost-found', 'individual-complaint', 'administrative-followup', 'broken-facilities', 'event-feedback', 'campus-whistleblowing', 'mental-health', 'other'));