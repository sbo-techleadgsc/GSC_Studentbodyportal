import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'
import { clsx } from '@/lib/clsx'

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-900/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="no-scrollbar flex overflow-x-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'relative flex min-w-[64px] flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-all duration-300 ease-out transform',
                isActive ? 'text-navy-900 scale-110' : 'text-ink-400 hover:scale-105'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon
                    className="h-5 w-5 transition-all duration-300 ease-out"
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  {isActive && (
                    <span className="absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full bg-success-600 animate-pulse" />
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
