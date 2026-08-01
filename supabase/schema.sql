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

create table freedom_wall (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  color text not null default 'yellow' check (color in ('yellow','pink','blue','green','orange')),
  created_at timestamptz default now(),
  likes int not null default 0,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by text
);

create table freedom_wall_meta (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references freedom_wall(id) on delete cascade,
  nickname text not null default '',
  sender_name text not null default '',
  recipient_name text not null default '',
  spotify_url text,
  spotify_query text,
  song_title text,
  song_artist text,
  song_artwork text,
  created_at timestamptz default now(),
  unique (message_id)
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
alter table freedom_wall enable row level security;
alter table freedom_wall_meta enable row level security;
alter table poll_options enable row level security;
alter table reports enable row level security;
alter table poll_votes enable row level security;

create policy "public read" on officers for select using (true);
create policy "public read" on promises for select using (true);
create policy "public read" on budget_items for select using (true);
create policy "public read" on updates for select using (true);
create policy "public read" on news for select using (true);
create policy "public read" on polls for select using (true);
create policy "public read" on freedom_wall for select using (true);
create policy "public read" on freedom_wall_meta for select using (true);
create policy "public read" on poll_options for select using (true);
create policy "public read" on reports for select using (true);

-- Reports: anyone can insert (submit), and authenticated users can update/delete them.
create policy "anyone can submit a report" on reports for insert with check (true);
create policy "authenticated users can update reports" on reports for update using (auth.role() = 'authenticated');
create policy "authenticated users can delete reports" on reports for delete using (auth.role() = 'authenticated');

-- Community wall: anyone can create notes, but only authenticated admins can remove them.
create policy "anyone can insert freedom wall posts" on freedom_wall
  for insert with check (true);
create policy "authenticated admins can update freedom wall posts" on freedom_wall
  for update using (auth.role() = 'authenticated');
create policy "authenticated admins can delete freedom wall posts" on freedom_wall
  for delete using (auth.role() = 'authenticated');

create policy "anyone can insert freedom wall meta" on freedom_wall_meta
  for insert with check (true);
create policy "authenticated admins can update freedom wall meta" on freedom_wall_meta
  for update using (auth.role() = 'authenticated');
create policy "authenticated admins can delete freedom wall meta" on freedom_wall_meta
  for delete using (auth.role() = 'authenticated');

-- Voting: allow signed-in public users to vote; one row per (poll, user) enforced above.
create policy "public users can vote" on poll_votes
  for insert with check (auth.uid() = user_id);
create policy "public users can read their own votes" on poll_votes
  for select using (auth.uid() = user_id);
