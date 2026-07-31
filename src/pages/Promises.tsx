import { useMemo, useState } from 'react'
import { CheckSquare } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card, StatusPill, EmptyState } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { promisesDb, pollsDb } from '@/lib/store'
import { clsx } from '@/lib/clsx'
import type { PromiseStatus } from '@/lib/types'

const FILTERS: { key: 'all' | PromiseStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'pending', label: 'Pending' },
]

export default function Promises() {
  const [promises] = useLiveData(promisesDb.list)
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)
  const [filter, setFilter] = useState<'all' | PromiseStatus>('all')

  const counts = useMemo(() => {
    const c = { completed: 0, 'in-progress': 0, pending: 0 }
    promises?.forEach((p) => (c[p.status] += 1))
    return c
  }, [promises])

  const filtered = promises?.filter((p) => filter === 'all' || p.status === filter)

  return (
    <div>
      <PageHero
        title="Promises"
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Promise Tracker</h2>
        <p className="mt-1.5 text-ink-600">Monitoring every campaign commitment made to students</p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card className="p-5 text-center">
            <p className="text-3xl font-extrabold text-success-600">{counts.completed}</p>
            <p className="mt-1 text-sm text-ink-600">Completed</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-3xl font-extrabold text-navy-900">{counts['in-progress']}</p>
            <p className="mt-1 text-sm text-ink-600">In Progress</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-3xl font-extrabold text-ink-400">{counts.pending}</p>
            <p className="mt-1 text-sm text-ink-600">Pending</p>
          </Card>
        </div>

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={clsx(
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                filter === key ? 'bg-navy-900 text-white' : 'bg-white text-ink-600 hover:bg-navy-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {filtered?.length === 0 && (
            <EmptyState icon={<CheckSquare className="h-10 w-10" />} title="No promises in this category yet" />
          )}
          {filtered?.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink-900">{p.title}</p>
                  <p className="text-sm text-ink-400">{p.officerName}</p>
                </div>
                <StatusPill status={p.status} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{p.description}</p>

              {p.status === 'in-progress' && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-ink-400">
                    <span>Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-navy-900 transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              )}

              {p.status === 'completed' && p.impactNote && (
                <div className="mt-4 rounded-app bg-success-100/50 px-4 py-3 text-sm text-success-600">
                  <span className="font-semibold">Impact: </span>
                  {p.impactNote}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
