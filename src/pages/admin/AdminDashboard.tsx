import { Link } from 'react-router-dom'
import { Users, CheckSquare, DollarSign, Radio, Flag, Newspaper, Vote, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Primitives'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useLiveData } from '@/lib/hooks'
import { officersDb, promisesDb, budgetDb, reportsDb, pollsDb } from '@/lib/store'
import { pesoCompact } from '@/lib/format'

const SHORTCUTS = [
  { to: '/admin/officers', label: 'Officers', icon: Users, desc: 'Add or edit elected officials' },
  { to: '/admin/promises', label: 'Promises', icon: CheckSquare, desc: 'Update campaign promise status' },
  { to: '/admin/budget', label: 'Budget', icon: DollarSign, desc: 'Update allocations and spending' },
  { to: '/admin/updates', label: 'Updates', icon: Radio, desc: 'Post meeting recaps and decisions' },
  { to: '/admin/reports', label: 'Reports', icon: Flag, desc: 'Review and resolve student reports' },
  { to: '/admin/news', label: 'News', icon: Newspaper, desc: 'Publish school announcements' },
  { to: '/admin/polls', label: 'Polls', icon: Vote, desc: 'Create and manage public voting' },
]

export default function AdminDashboard() {
  const { adminName } = useAdminAuth()
  const [officers] = useLiveData(officersDb.list)
  const [promises] = useLiveData(promisesDb.list)
  const [budget] = useLiveData(budgetDb.list)
  const [reports] = useLiveData(reportsDb.list)
  const [polls] = useLiveData(pollsDb.list)

  const newReports = reports?.filter((r) => r.status === 'new').length ?? 0
  const totalBudget = budget?.reduce((s, b) => s + b.allocated, 0) ?? 0

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Welcome, {adminName}</h1>
      <p className="mt-1 text-ink-600">Here's what's happening across the portal.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat value={String(officers?.length ?? 0)} label="Officers" />
        <Stat value={String(promises?.length ?? 0)} label="Promises" />
        <Stat value={pesoCompact(totalBudget)} label="Budget" />
        <Stat value={String(newReports)} label="New Reports" highlight={newReports > 0} />
      </div>

      {newReports > 0 && (
        <Link to="/admin/reports">
          <Card className="mt-6 flex items-center justify-between border border-gold-400/40 bg-gold-50 p-4 !shadow-none">
            <p className="text-sm font-semibold text-ink-900">
              You have {newReports} new report{newReports === 1 ? '' : 's'} awaiting review.
            </p>
            <ArrowRight className="h-4 w-4 text-ink-900" />
          </Card>
        </Link>
      )}

      <h2 className="mt-8 text-lg font-bold text-ink-900">Manage Content</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTCUTS.map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to}>
            <Card className="flex h-full items-start gap-3 p-5 transition-transform hover:-translate-y-0.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-900">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="font-bold text-ink-900">{label}</p>
                <p className="mt-0.5 text-xs text-ink-600">{desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-400">
        {polls?.filter((p) => p.isOpen).length ?? 0} open poll(s) right now. Changes here reflect on the public site instantly.
      </p>
    </div>
  )
}

function Stat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <Card className={`p-5 text-center ${highlight ? 'border border-gold-400/40 bg-gold-50 !shadow-none' : ''}`}>
      <p className="text-2xl font-extrabold text-navy-900">{value}</p>
      <p className="mt-1 text-xs text-ink-600">{label}</p>
    </Card>
  )
}
