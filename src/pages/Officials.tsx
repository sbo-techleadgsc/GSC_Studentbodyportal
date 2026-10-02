import { useState } from 'react'
import { ChevronDown, Mail } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { officersDb, pollsDb } from '@/lib/store'
import { siteConfig } from '@/config/site'
import { clsx } from '@/lib/clsx'

export default function Officials() {
  const [officers] = useLiveData(officersDb.list)
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div>
      <PageHero
        title="Officials"
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Elected Officials</h2>
        <p className="mt-1.5 font-thin text-ink-600">{siteConfig.academicYear} Student Organization Officers</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {officers?.map((officer) => {
            const isOpen = expanded === officer.id
            return (
              <Card key={officer.id} className="overflow-hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-900">
                  <img src={officer.photoUrl} alt={officer.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent p-4 pt-10">
                    <p className="text-lg font-bold leading-tight text-white">{officer.name}</p>
                    <p className="text-sm text-navy-100/85">{officer.position}</p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-ink-600">{officer.year} &middot; {officer.major}</p>

                  {officer.bio && (
                    <div
                      className={clsx(
                        'grid transition-all duration-300 ease-out',
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-3 text-sm leading-relaxed text-ink-600">{officer.bio}</p>
                        <a
                          href={`mailto:${officer.email}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" /> {officer.email}
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setExpanded(isOpen ? null : officer.id)}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-900"
                  >
                    {isOpen ? 'Hide profile' : 'View profile'}
                    <ChevronDown className={clsx('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
