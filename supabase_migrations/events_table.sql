-- Events calendar table for school & org events
-- Run this in Supabase's SQL editor once (idempotent: safe to re-run).

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'School'
    CHECK (category IN ('School', 'Organization', 'Assembly', 'Other')),
  location text,
  start_date date NOT NULL DEFAULT current_date,
  end_date date,
  start_time text,
  end_time text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast "events on this day" queries
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events (start_date);

-- Row Level Security: anyone can read the calendar.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to events"
  ON events FOR SELECT
  USING (true);

-- Only authenticated admins (users listed in the admins table) can manage events.
CREATE POLICY "Allow admins to insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Allow admins to update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Allow admins to delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );
