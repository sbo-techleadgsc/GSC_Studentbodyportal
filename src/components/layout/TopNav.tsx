import { NavLink, Link } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'
import { clsx } from '@/lib/clsx'
import gscLogo from '@/assets/personal_assets/gsc_logo_favicon.svg'

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/10 bg-navy-900/95 backdrop-blur transition-all duration-300 ease-out md:block hover:bg-navy-900/98">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 transition-transform duration-300 ease-out hover:scale-105">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all duration-300 ease-out hover:bg-white/20 sm:h-10 sm:w-10">
            <img src={gscLogo} alt="" className="h-6 w-6 rounded-full object-contain sm:h-7 sm:w-7" />
          </span>
          <span className="text-[15px] font-bold leading-tight text-white transition-all duration-300 ease-out">
            GSC Student Council
          </span>
        </Link>

        {/* Desktop: full pill nav, inline (scrolls horizontally if it doesn't fit) */}
        <nav className="no-scrollbar hidden items-center gap-1 overflow-x-auto lg:flex xl:gap-1.5">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 xl:px-3.5',
                  isActive
                    ? 'bg-white text-navy-900 scale-105 shadow-lg shadow-white/20'
                    : 'text-navy-100/80 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tablet only: underline tab bar, second row */}
      <div className="border-t border-white/10 lg:hidden">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 py-1.5">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'shrink-0 border-b-2 px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ease-out active:scale-95',
                  isActive
                    ? 'border-gold-400 text-white scale-105'
                    : 'border-transparent text-navy-100/70 hover:text-white hover:scale-105'
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
