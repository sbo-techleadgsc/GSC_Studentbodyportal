import { Clock, Newspaper } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card, Badge, EmptyState } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { newsDb, pollsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { siteConfig } from '@/config/site'

export default function News() {
  const [news] = useLiveData(newsDb.list)
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)

  return (
    <div>
      <PageHero
        title="News"
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">School News</h2>
        <p className="mt-1.5 text-ink-600">Latest announcements from {siteConfig.orgShortName}</p>

        {news?.length === 0 && (
          <div className="mt-8">
            <EmptyState icon={<Newspaper className="h-10 w-10" />} title="No news posted yet" />
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {news?.map((n) => (
            <Card key={n.id} className="overflow-hidden">
              {n.imageUrl && <img src={n.imageUrl} alt={n.title} className="h-44 w-full object-cover" />}
              <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="navy">{n.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-ink-400">
                    <Clock className="h-3.5 w-3.5" /> {formatDate(n.date)}
                  </span>
                </div>
                <p className="mt-3 font-bold leading-snug text-ink-900">{n.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{n.content}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
