import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site'
import gscSboLogo from '@/assets/personal_assets/gsc_sbo_logo.png'

const EXPLORE_LINKS = [
  { to: '/officials', label: 'Officials' },
  { to: '/promises', label: 'Promises' },
  { to: '/budget', label: 'Budget' },
  { to: '/reports', label: 'Reports' },
]

const ORG_LINKS = [
  { to: '/news', label: 'News' },
  { to: '/events', label: 'Events' },
  { to: '/voting', label: 'Voting' },
  { to: '/community', label: 'Community' },
]

export function Footer() {
  return (
    <footer className="mt-10 border-t border-navy-900/10 bg-surface pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src={gscSboLogo} alt="GSC SBO" className="h-9 w-auto object-contain" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">{siteConfig.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">Explore</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {EXPLORE_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-ink-600 transition-colors hover:text-navy-900">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">Organization</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {ORG_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-ink-600 transition-colors hover:text-navy-900">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">Contact</p>
            <p className="mt-4 text-sm text-ink-600">{siteConfig.contactEmail}</p>
            <p className="mt-1 text-sm text-ink-400">{siteConfig.academicYear}</p>
            <p className="mt-4 text-xs text-ink-400">
              {siteConfig.schoolName} &middot; {siteConfig.orgName}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-navy-900/5 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400">
            &copy; {new Date().getFullYear()} {siteConfig.schoolName} {siteConfig.orgName}. All rights reserved.
          </p>
          <p className="text-xs text-ink-400">
            {siteConfig.creatorName} &middot; {siteConfig.creatorRole}
          </p>
        </div>
      </div>
    </footer>
  )
}