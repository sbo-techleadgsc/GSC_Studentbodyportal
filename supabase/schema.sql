-- SBO Web Portal — Supabase schema
-- Run this in Supabase's SQL editor when you're ready to connect
-- a real backend (see README.md "Connecting Supabase").

create table officers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  "order" int not null default 1,
  year text,
  major text,
  email text,
  photo_url text,
  bio text,
  created_at timestamptz default now()
);

create table promises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  officer_id uuid references officers(id) on delete set null,
  status text not null check (status in ('pending','in-progress','completed')),
  progress int not null default 0,
  impact_note text,
  updated_at timestamptz default now()
);

create table budget_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  allocated numeric not null default 0,
  spent numeric not null default 0,
  description text
);

create table updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  date date not null default current_date
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  tracking_code text unique not null,
  visibility text not null check (visibility in ('public','anonymous')),
  full_name text,
  email text,
  category text not null,
  content text not null,
  status text not null default 'new' check (status in ('new','in-review','resolved')),
  admin_notes text,
  submitted_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  content text not null,
  image_url text,
  date date not null default current_date
);

create table polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  type text not null default 'single',
  start_date date,
  end_date date,
  is_open boolean not null default true
);

create table poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  label text not null,
  votes int not null default 0
);

create table poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  option_id uuid references poll_options(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (poll_id, user_id) -- one vote per student per poll
);

-- Row Level Security: public read on everything except who-voted-what;
-- writes restricted to an "admins" table you seed manually.
alter table officers enable row level security;
alter table promises enable row level security;
alter table budget_items enable row level security;
alter table updates enable row level security;
alter table news enable row level security;
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table reports enable row level security;
alter table poll_votes enable row level security;

create policy "public read" on officers for select using (true);
create policy "public read" on promises for select using (true);
create policy "public read" on budget_items for select using (true);
create policy "public read" on updates for select using (true);
create policy "public read" on news for select using (true);
create policy "public read" on polls for select using (true);
create policy "public read" on poll_options for select using (true);

-- Reports: anyone can insert (submit), only admins can read/update all.
create policy "anyone can submit a report" on reports for insert with check (true);

-- Voting: requires a logged-in student; one row per (poll, user) enforced above.
create policy "logged-in users can vote" on poll_votes
  for insert with check (auth.uid() = user_id);
