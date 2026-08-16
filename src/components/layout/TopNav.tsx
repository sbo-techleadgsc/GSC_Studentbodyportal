import { NavLink, Link } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'
import { clsx } from '@/lib/clsx'
import gscSboLogo from '@/assets/personal_assets/gsc_sbo_logo.png'

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-navy-900/10 bg-white/90 backdrop-blur transition-colors duration-200 md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src={gscSboLogo} alt="GSC SBO" className="h-8 w-auto object-contain sm:h-9" />
        </Link>

        {/* Desktop: minimal text links */}
        <nav className="hidden items-center gap-1 lg:flex xl:gap-1.5">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors duration-200',
                  isActive
                    ? 'bg-navy-900 text-white'
                    : 'text-ink-600 hover:bg-navy-50 hover:text-navy-900'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tablet: minimal text links, second row */}
      <div className="border-t border-navy-900/5 lg:hidden">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 py-1.5">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors duration-200',
                  isActive
                    ? 'bg-navy-900 text-white'
                    : 'text-ink-600 hover:bg-navy-50 hover:text-navy-900'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}