// ─────────────────────────────────────────────────────────────
// SITE CONFIG — edit this one file to re-brand the whole portal.
// Nothing else in /src should need to change for a new term,
// a new creator credit, or a new school year.
// ─────────────────────────────────────────────────────────────

export const siteConfig = {
  schoolName: 'The Axis',
  orgName: 'Student Body Organization',
  orgShortName: 'The Axis',
  academicYear: 'AY 2026-2027',
  tagline:
    'Your central hub for student governance - where transparency meets action. Every official, every promise, every peso, every decision, all in one place, open to you.',

  // Admin emails are recognized on the public Account page so admins
  // are not asked for a Student ID when they sign up/sign in. Keep this
  // list in sync with the `admins` table (the admins table is still the
  // source of truth for actual admin powers).
  adminEmails: [
    'gsc.sbofficial@gmail.com',
  ] as string[],

  // Update with your own name/role before launch.
  creatorName: 'Crisanto T. Viray',
  creatorRole: 'Tech Lead & PIO',
  creditBlurb:
    'Conceptualized, designed, and developed in service of students. Built to keep governance open, accountable, and within reach.',

  contactEmail: 'sbo@gsc.edu.ph',
  domain: 'axis-portal.com', // placeholder — replace once you buy your domain
}
