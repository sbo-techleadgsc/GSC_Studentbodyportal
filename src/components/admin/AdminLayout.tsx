import type { ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  DollarSign,
  Radio,
  Flag,
  Newspaper,
  Vote,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { clsx } from '@/lib/clsx'

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/officers', label: 'Officers', icon: Users },
  { to: '/admin/promises', label: 'Promises', icon: CheckSquare },
  { to: '/admin/budget', label: 'Budget', icon: DollarSign },
  { to: '/admin/updates', label: 'Updates', icon: Radio },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/news', label: 'News', icon: Newspaper },
  { to: '/admin/polls', label: 'Polls', icon: Vote },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { adminName, logout } = useAdminAuth()

  return (
    <div className="min-h-screen bg-surface md:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-navy-900/10 bg-white md:flex">
        <div className="border-b border-navy-900/10 px-5 py-5">
          <p className="text-sm font-bold text-ink-900">SBO Admin</p>
          <p className="text-xs text-ink-400">Signed in as {adminName}</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 rounded-app px-3 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-navy-900 text-white' : 'text-ink-600 hover:bg-navy-50'
                )
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-navy-900/10 p-3">
          <Link to="/" className="flex items-center gap-2.5 rounded-app px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-navy-50">
            <ExternalLink className="h-4 w-4" /> View public site
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-app px-3 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-100/50">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="border-b border-navy-900/10 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink-900">SBO Admin</p>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-semibold text-navy-900">Public site</Link>
            <button onClick={logout} className="text-xs font-semibold text-danger-600">Log out</button>
          </div>
        </div>
        <nav className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          {ADMIN_NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  isActive ? 'bg-navy-900 text-white' : 'bg-surface-muted text-ink-600'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="min-w-0 flex-1 p-5 sm:p-8">{children}</div>
    </div>
  )
}
