-- ══════════════════════════════════════════════════════════════
-- DEMO / MOCKUP DATA — temporary, easily removable.
--
-- Every row uses IDs starting with 00000000-0000-4000-8000- so it
-- can be wiped in one shot by running remove_demo_data.sql.
-- Officers are intentionally NOT seeded (real data lives there).
-- Safe to re-run: inserts skip IDs that already exist.
-- Run in the Supabase SQL editor.
-- ══════════════════════════════════════════════════════════════

-- ── Promises ──────────────────────────────────────────────────
insert into public.promises (id, title, description, officer_id, status, progress, impact_note, updated_at) values
  ('00000000-0000-4000-8000-000000000001', 'Free late-night shuttle for night classes',
   'Partner with accredited jeepney operators to run a shuttle loop between campus and the public terminal every Friday for students in evening classes.',
   null, 'in-progress', 45,
   'MOU drafted; waiting on the transport cooperative board.',
   current_date - 2),
  ('00000000-0000-4000-8000-000000000002', 'Water refill stations on every floor',
   'Install and maintain filtered water refill stations in all three buildings so students stop buying bottled water.',
   null, 'completed', 100,
   'Six units installed as of July; maintenance budget added to AY 2026-2027.',
   current_date - 20),
  ('00000000-0000-4000-8000-000000000003', 'Semester-wide organization fair',
   'Bring back a two-day club fair at the covered court during the first month of classes with booths, performances, and sign-up drives.',
   null, 'pending', 0,
   null,
   current_date - 35),
  ('00000000-0000-4000-8000-000000000004', 'Anonymous suggestion boxes per department',
   'Physical suggestion boxes plus a digital form, reviewed every Friday by the SBO executive committee.',
   null, 'in-progress', 70,
   'Four of six departments have boxes installed; digital form is live.',
   current_date - 5)
on conflict (id) do nothing;

-- ── Budget ────────────────────────────────────────────────────
insert into public.budget (id, category, allocated, spent, description) values
  ('00000000-0000-4000-8000-000000000101', 'Events & Activities', 60000, 38500,
   'Foundation day, organization fair, sports fest logistics.'),
  ('00000000-0000-4000-8000-000000000102', 'Student Development', 45000, 21000,
   'Leadership trainings, seminar speaker honoraria.'),
  ('00000000-0000-4000-8000-000000000103', 'Facilities & Equipment', 50000, 30500,
   'Water refill stations, covered court repairs, sound system rental.'),
  ('00000000-0000-4000-8000-000000000104', 'Publications & Info', 25000, 19800,
   'The Axis newsletter printing, tarpaulins, portal hosting/domain.'),
  ('00000000-0000-4000-8000-000000000105', 'Community Outreach', 30000, 12000,
   'Adopt-a-school clean-up drive and donation caravans.'),
  ('00000000-0000-4000-8000-000000000106', 'Operations', 20000, 17600,
   'Office supplies, SBO room improvements, miscellaneous.')
on conflict (id) do nothing;

-- ── Updates ───────────────────────────────────────────────────
insert into public.updates (id, title, category, description, date) values
  ('00000000-0000-4000-8000-000000000201', 'Class suspensions announced via portal push',
   'Announcement',
   'Starting this semester, suspension and weather advisories will be posted here first before any other channel.',
   to_char(current_date - 1, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000202', 'Covered court repainting finished',
   'Facilities',
   'The student-funded repainting of the covered court bleachers is done — just in time for intramurals.',
   to_char(current_date - 4, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000203', 'SBO office now open until 6 PM',
   'Announcement',
   'Officer duty rotations extended so walk-in concerns can be filed after afternoon classes.',
   to_char(current_date - 8, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000204', 'Intramurals 2026 tentative schedule released',
   'Event',
   'Draft brackets and venue assignments are up. Department reps, expect your packets this week.',
   to_char(current_date - 11, 'YYYY-MM-DD'))
on conflict (id) do nothing;

-- ── News ──────────────────────────────────────────────────────
insert into public.news (id, title, category, content, image_url, date) values
  ('00000000-0000-4000-8000-000000000301', 'The Axis launches one-stop transparency portal',
   'Announcement',
   E'[WRITTEN BY: Crisanto T. Viray]\n[SHOT BY: Axis Media Team]\n[SOURCE: SBO Public Information Office]\n\nEvery official, every promise, every peso, and every decision of the Student Body Organization is now viewable in a single portal open to all bona fide students.\n\nThe platform allows students to track campaign promises per official, audit fund allocation by category, and file reports that go straight to the executive board.\n\n"This is governance you do not have to chase," the SBO president said during the launch briefing. "If we promised it, you can watch it happen — or ask us why it has not."',
   null,
   to_char(current_date - 3, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000302', 'Intramurals 2026: what changes this year',
   'Events',
   E'This year''s intramurals move to a single-venue format at the covered court to cut setup costs, with savings redirected to prizes and medals.\n\nTryouts open next week. Course-based teams keep their traditional colors, and a new esports exhibition bracket joins the lineup on day two.\n\nFull schedules drop on the Events tab once the PE department signs off on venue timeslots.',
   null,
   to_char(current_date - 7, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000303', 'Portal voting verified for upcoming referendum',
   'Update',
   'One account equals one vote. Guest and anonymous sessions are blocked from polls to keep results auditable, and duplicate votes per poll are enforced at the database level.',
   null,
   to_char(current_date - 12, 'YYYY-MM-DD'))
on conflict (id) do nothing;

-- ── Events ────────────────────────────────────────────────────
insert into public.events (id, title, description, category, location, start_date, end_date, start_time, end_time, image_url) values
  ('00000000-0000-4000-8000-000000000401', 'Buwan ng Wika Closing Program',
   'Culminating program: sabayang pagbigkas, damath exhibit, and Filipino film screening.',
   'School', 'Covered Court', current_date + 6, current_date + 6, '08:00', '12:00', null),
  ('00000000-0000-4000-8000-000000000402', 'Intramurals 2026 Tryouts Week',
   'Per-sport tryouts across all departments. Bring your own gear; jerseys provided on match days.',
   'Organization', 'Various Venues', current_date + 9, current_date + 13, '15:00', '17:30', null),
  ('00000000-0000-4000-8000-000000000403', 'General Assembly: State of the Student Body',
   'Semester report from the executive board — promises status, budget burn-down, and open Q&A.',
   'Assembly', 'Audio-Visual Room', current_date + 16, current_date + 16, '13:00', '15:00', null),
  ('00000000-0000-4000-8000-000000000404', 'Adopt-a-School Clean-Up Drive',
   'Community outreach caravan. Volunteer slots limited to 60 students; register at the SBO office.',
   'Organization', 'Barangay Hall Grounds', current_date + 23, current_date + 23, '07:00', '11:00', null),
  ('00000000-0000-4000-8000-000000000405', 'First Semester Organization Fair',
   'Two-day club fair with booths, performances, and sign-up drives.',
   'School', 'Covered Court', current_date + 30, current_date + 31, '09:00', '16:00', null)
on conflict (id) do nothing;

-- ── Polls ─────────────────────────────────────────────────────
insert into public.polls (id, question, type, is_open, start_date, end_date) values
  ('00000000-0000-4000-8000-000000000501',
   'Where should the next student development fund go?',
   'single', true,
   to_char(current_date - 2, 'YYYY-MM-DD'), to_char(current_date + 7, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000502',
   'Which intramural side events should we bring back?',
   'multiple', false,
   to_char(current_date - 20, 'YYYY-MM-DD'), to_char(current_date - 8, 'YYYY-MM-DD'))
on conflict (id) do nothing;

insert into public.poll_options (id, poll_id, label, votes) values
  ('00000000-0000-4000-8000-000000000511', '00000000-0000-4000-8000-000000000501', 'Leadership training summit', 87),
  ('00000000-0000-4000-8000-000000000512', '00000000-0000-4000-8000-000000000501', 'Peer tutoring program', 134),
  ('00000000-0000-4000-8000-000000000513', '00000000-0000-4000-8000-000000000501', 'Mental health first-aid seminars', 96),
  ('00000000-0000-4000-8000-000000000521', '00000000-0000-4000-8000-000000000502', 'Laro ng Lahi exhibitions', 61),
  ('00000000-0000-4000-8000-000000000522', '00000000-0000-4000-8000-000000000502', 'Battle of the bands', 118),
  ('00000000-0000-4000-8000-000000000523', '00000000-0000-4000-8000-000000000502', 'Esports exhibition bracket', 143)
on conflict (id) do nothing;

-- ── Freedom Wall ──────────────────────────────────────────────
insert into public.freedom_wall (id, message, color, created_at, likes, is_deleted, deleted_at, deleted_by) values
  ('00000000-0000-4000-8000-000000000601', 'Shoutout sa BS Nursing batch reps — ang ganda ng bulletin board niyo!', 'yellow', now() - interval '3 hours', 12, false, null, null),
  ('00000000-0000-4000-8000-000000000602', 'Good luck sa mga magte-take ng board exams this month. Kaya natin ''to.', 'pink', now() - interval '9 hours', 34, false, null, null),
  ('00000000-0000-4000-8000-000000000603', 'Salamat sa bagong water refill station sa Building B, life saver talaga.', 'blue', now() - interval '1 day', 27, false, null, null),
  ('00000000-0000-4000-8000-000000000604', 'To whoever left free reviewers sa library table kanina — you are the moment.', 'green', now() - interval '2 days', 51, false, null, null),
  ('00000000-0000-4000-8000-000000000605', 'Petition to make the org fair an annual thing na talaga. Two days is not enough!', 'orange', now() - interval '3 days', 19, false, null, null)
on conflict (id) do nothing;

-- ── Reports ───────────────────────────────────────────────────
insert into public.reports (
  id, tracking_code, visibility, full_name, email, student_id, section,
  contact_method, contact_value, category, content, status,
  admin_notes, admin_reply, is_anonymous, disclaimer_accepted, is_approved, is_shadowbanned,
  created_at, updated_at
) values
  ('00000000-0000-4000-8000-000000000701', 'SBO-DEMO1', 'public',
   'Maria Santos', 'maria.santos@gmail.com', '00-10245', 'BS-Nursing-2A',
   'email', 'maria.santos@gmail.com', 'broken-facilities',
   'The second water refill station in Building B has been leaking since Monday. The floor gets slippery near the stairwell.',
   'pending', null, null,
   false, true, true, false, now() - interval '6 hours', now() - interval '6 hours'),

  ('00000000-0000-4000-8000-000000000702', 'SBO-DEMO2', 'public',
   'John Dela Cruz', 'jdelacruz@gmail.com', '00-20871', 'BSED-Math-3B',
   'messenger', 'fb.com/jdelacruz', 'event-feedback',
   'Can the intramural tryouts schedule avoid overlapping with Saturday review classes? A lot of seniors want to join but cannot make the 3 PM slot.',
   'under-review', 'Forwarded to sports coordinator for slot adjustments.', null,
   false, true, true, false, now() - interval '2 days', now() - interval '1 day'),

  ('00000000-0000-4000-8000-000000000703', 'SBO-DEMO3', 'public',
   'Angela Reyes', 'areyes@gmail.com', '00-31502', 'BS-Bio-1A',
   'sms', '0917 555 0143', 'direct-inquiry',
   'Hi! Are non-officers allowed to volunteer for the Adopt-a-School clean-up drive, or is it officers only?',
   'resolved',
   null,
   'Open to all bona fide students! Register at the SBO office — 60 slots only, first come first served.',
   false, true, true, false, now() - interval '5 days', now() - interval '4 days'),

  ('00000000-0000-4000-8000-000000000704', 'SBO-DEMO4', 'anonymous',
   null, null, null, null,
   null, null, 'campus-whistleblowing',
   'An officer handling event logistics has been asking suppliers for personal commissions on quotations. I can share screenshots if needed.',
   'pending',
   'Discreet verification initiated with the adviser.', null,
   true, true, true, false, now() - interval '1 day', now() - interval '1 day')
on conflict (id) do nothing;