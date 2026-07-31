# GSC SBO Web Portal

A transparent student body organization web portal — officials, campaign
promise tracking, budget transparency, live updates, student reports
(public or anonymous), news, and public voting, all in one place.

Built with **React + Vite + Tailwind CSS**. Currently runs on local
mock data so you can use and demo it immediately; it's structured to
swap in **Supabase** (database + auth) with minimal changes when you're
ready for a real launch.

---

## 1. Run it locally

You need [Node.js](https://nodejs.org) installed (v18+).

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

- Public site: `/`
- Admin panel: `/admin` — demo passcode is **`gsc-sbo-2026`**
  (change this in `src/context/AdminAuthContext.tsx` before sharing
  it with anyone)

Everything you add/edit in the admin panel is saved in your browser's
localStorage, so it'll be there next time you open the site on the
same computer/browser.

---

## 2. Deploying it (Vercel)

1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework preset: **Vite**. Build command and output are already
   configured (`npm run build`, outputs to `dist/`).
4. Deploy. You'll get a live URL immediately; point your real domain
   at it later from Vercel's Domains settings.

No environment variables are required until you connect Supabase (step 4).

---

## 3. Re-branding for your school

Everything school-specific lives in **`src/config/site.ts`** — school
name, org name, academic year, tagline, and creator credit. Edit that
one file and it updates every page.

Colors, font, and border radius live in **`src/index.css`** under the
`@theme` block (`--color-navy-900`, `--color-gold-500`, etc.) if you
ever need to adjust the palette.

---

## 4. Connecting Supabase (for a real launch)

The app is already wired to Supabase for data reads/writes and realtime
updates. The remaining setup is to connect your own project and choose
how you want admins and voters to authenticate.

1. Create a free project at supabase.com.
2. In the SQL editor, run **`supabase/schema.sql`** (included in this
   project) to create all the tables.
3. Copy `.env.example` to `.env.local` and paste in your project's
   URL and anon key (Settings → API in Supabase).
4. The data layer in `src/lib/store.ts` now talks to Supabase tables
   directly, so no page or component changes are needed for CRUD.
5. The realtime subscription in `src/lib/store.ts` is already enabled
   for table changes, so admin edits should auto-refresh the public
   views.
6. The admin login in `src/context/AdminAuthContext.tsx` now supports
   Supabase magic links and falls back to the demo passcode for local
   testing. Replace that flow with your preferred school-managed auth
   provider when you are ready for production.
7. Voting is now gated behind sign-in. The app uses Supabase auth for
   the sign-in step and the existing `poll_votes` uniqueness rule to
   prevent duplicate votes.

---

## 5. Using the admin panel

Go to `/admin`, sign in with the passcode, and you'll see a dashboard
with shortcuts to every section:

- **Officers** — add/edit/remove, photo URL, bio
- **Promises** — status (Pending / In Progress / Completed), progress
  slider, "impact note" once completed
- **Budget** — categories, allocated vs. spent
- **Updates** — post meeting recaps to the live timeline
- **Reports** — review submissions, change status, leave admin notes
- **News** — publish announcements
- **Polls** — create polls, open/close voting

Everything updates on the public site instantly — no code, no deploys
needed for day-to-day content changes.

---

## 6. Project structure

```
src/
  config/site.ts          <- edit this to re-brand
  lib/
    types.ts               <- all data shapes
    store.ts                <- data layer (swap for Supabase here)
    hooks.ts                 <- useLiveData() keeps UI in sync
  data/seed.ts              <- sample starter content
  context/AdminAuthContext.tsx  <- demo login (swap for Supabase Auth)
  components/
    layout/                  <- TopNav, BottomNav, PageHero
    ui/                       <- Button, Card, Badge, Modal, form fields
    admin/                    <- AdminLayout, AdminGuard
  pages/                      <- the 8 public pages
  pages/admin/                <- admin dashboard + one page per section
supabase/schema.sql          <- run this in Supabase when you connect it
```

---

## 7. Handing this off to the next SBO

- Update `src/config/site.ts` with the new term's names/dates.
- Change the admin passcode (or, better, finish the Supabase Auth
  swap so each officer has their own login).
- Walk them through section 5 above — that's the whole job.

---

Built for Good Samaritan Colleges SBO. Pass it down.
