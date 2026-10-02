-- Extra safety: Row Level Security for voting, events, and site settings.
-- Everything is idempotent (DROP ... IF EXISTS / guards), so this whole file
-- can be re-run safely. Run it in the Supabase SQL editor (postgres role).

-- ─────────────────────────────────────────────────────────────
-- poll_votes: only verified (non-anonymous) students can vote.
-- ─────────────────────────────────────────────────────────────
alter table public.poll_votes enable row level security;

drop policy if exists "Allow authenticated students to vote" on public.poll_votes;
create policy "Allow authenticated students to vote"
  on public.poll_votes for insert
  to authenticated
  with check ((coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false));

-- Admins can read the vote ledger for audits (transparency).
drop policy if exists "Allow admins to read poll votes" on public.poll_votes;
create policy "Allow admins to read poll votes"
  on public.poll_votes for select
  to authenticated
  using (exists (select 1 from public.admins where admins.id = auth.uid()));

-- One vote per student per poll, enforced by the database.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'poll_votes_poll_id_user_id_key'
      and conrelid = 'poll_votes'::regclass
  ) then
    alter table public.poll_votes
      add constraint poll_votes_poll_id_user_id_key unique (poll_id, user_id);
  end if;
end $$;

-- Vote tallies are bumped by a trigger, never by client code, so
-- students can't inflate counts. poll_options writes are admin-only.
create or replace function public.bump_poll_option_votes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.poll_options
    set votes = votes + 1
    where id = new.option_id;
  return new;
end;
$$;

drop trigger if exists trg_poll_votes_bump on public.poll_votes;
create trigger trg_poll_votes_bump
  after insert on public.poll_votes
  for each row execute function public.bump_poll_option_votes();

-- ─────────────────────────────────────────────────────────────
-- polls: public read, admins only write.
-- ─────────────────────────────────────────────────────────────
alter table public.polls enable row level security;

drop policy if exists "Allow public read polls" on public.polls;
create policy "Allow public read polls"
  on public.polls for select using (true);

drop policy if exists "Allow admins to manage polls" on public.polls;
create policy "Allow admins to manage polls"
  on public.polls for all
  to authenticated
  using (exists (select 1 from public.admins where admins.id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- poll_options: public read, admins only write (votes via trigger).
-- ─────────────────────────────────────────────────────────────
alter table public.poll_options enable row level security;

drop policy if exists "Allow public read poll options" on public.poll_options;
create policy "Allow public read poll options"
  on public.poll_options for select using (true);

drop policy if exists "Allow admins to manage poll options" on public.poll_options;
create policy "Allow admins to manage poll options"
  on public.poll_options for all
  to authenticated
  using (exists (select 1 from public.admins where admins.id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- events: public read, admins only write (re-asserted idempotently).
-- ─────────────────────────────────────────────────────────────
alter table public.events enable row level security;

drop policy if exists "Allow public read access to events" on public.events;
create policy "Allow public read access to events"
  on public.events for select using (true);

drop policy if exists "Allow admins to insert events" on public.events;
create policy "Allow admins to insert events"
  on public.events for insert
  to authenticated
  with check (exists (select 1 from public.admins where admins.id = auth.uid()));

drop policy if exists "Allow admins to update events" on public.events;
create policy "Allow admins to update events"
  on public.events for update
  to authenticated
  using (exists (select 1 from public.admins where admins.id = auth.uid()));

drop policy if exists "Allow admins to delete events" on public.events;
create policy "Allow admins to delete events"
  on public.events for delete
  to authenticated
  using (exists (select 1 from public.admins where admins.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- site_settings: public read (maintenance-mode check runs with the
-- anon key before the React app loads), admins only write.
-- ─────────────────────────────────────────────────────────────
alter table public.site_settings enable row level security;

drop policy if exists "Allow public read site settings" on public.site_settings;
create policy "Allow public read site settings"
  on public.site_settings for select using (true);

drop policy if exists "Allow admins to manage site settings" on public.site_settings;
create policy "Allow admins to manage site settings"
  on public.site_settings for all
  to authenticated
  using (exists (select 1 from public.admins where admins.id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.id = auth.uid()));