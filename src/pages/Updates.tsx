import { Clock, Radio } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card, Badge, EmptyState } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { updatesDb, pollsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'

export default function Updates() {
  const [updates] = useLiveData(updatesDb.list)
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)

  return (
    <div>
      <PageHero
        title="Updates"
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Live Updates</h2>
        <p className="mt-1.5 text-ink-600">Recent meetings, decisions, and org-wide announcements</p>

        {updates?.length === 0 && (
          <div className="mt-8">
            <EmptyState icon={<Radio className="h-10 w-10" />} title="No updates posted yet" />
          </div>
        )}

        <div className="relative mt-8 space-y-6 border-l-2 border-navy-900/10 pl-6">
          {updates?.map((u) => (
            <div key={u.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-navy-900" />
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-bold leading-snug text-ink-900">{u.title}</p>
                  <Badge tone="gold">{u.category}</Badge>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
                  <Clock className="h-3.5 w-3.5" /> {formatDate(u.date)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{u.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
