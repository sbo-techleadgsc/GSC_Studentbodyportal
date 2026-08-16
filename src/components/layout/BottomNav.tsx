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
                'relative flex min-w-[56px] flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors duration-200 active:scale-90',
                isActive ? 'text-navy-900' : 'text-ink-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
