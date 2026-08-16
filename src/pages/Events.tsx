import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card, Badge, Button, EmptyState } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { eventsDb, pollsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { clsx } from '@/lib/clsx'
import type { EventCategory, ScheduledEvent } from '@/lib/types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const CATEGORY_CHIP: Record<EventCategory, string> = {
  School: 'bg-navy-100 text-navy-900',
  Organization: 'bg-gold-100 text-gold-600',
  Assembly: 'bg-success-100 text-success-600',
  Other: 'bg-surface-muted text-ink-600',
}

const CATEGORY_TONE: Record<EventCategory, 'navy' | 'gold' | 'success' | 'neutral'> = {
  School: 'navy',
  Organization: 'gold',
  Assembly: 'success',
  Other: 'neutral',
}

const toKey = (date: Date) => date.toISOString().slice(0, 10)

function buildMonth(year: number, month: number): Date[] {
  const startOffset = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: Date[] = []
  for (let i = startOffset - 1; i >= 0; i--) cells.push(new Date(Date.UTC(year, month, -i)))
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(Date.UTC(year, month, day)))
  const trailing = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
  for (let i = 1; i <= trailing; i++) cells.push(new Date(Date.UTC(year, month + 1, i)))
  return cells
}

function dayKeyToUTC(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export default function Events() {
  const [events] = useLiveData(eventsDb.list)
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)

  const today = new Date()
  const [cursor, setCursor] = useState(() => new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)))
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const year = cursor.getUTCFullYear()
  const month = cursor.getUTCMonth()
  const cells = buildMonth(year, month)
  const todayKey = toKey(today)

  const eventsByDay = new Map<string, ScheduledEvent[]>()
  events?.forEach((event) => {
    const start = event.startDate
    const end = event.endDate ?? event.startDate
    for (let d = start; d <= end; d = nextKey(d)) {
      const bucket = eventsByDay.get(d) ?? []
      bucket.push(event)
      eventsByDay.set(d, bucket)
    }
  })

  const upcoming = (events ?? [])
    .filter((e) => !e.endDate || e.endDate >= todayKey)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 6)

  const selectedDayEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : []

  return (
    <div>
      <PageHero
        title="Events Calendar"
        subtitle="School and org events, assemblies, and activities — all in one place."
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Calendar */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold tracking-tight text-ink-900">
                {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
              </h2>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setCursor(new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)))}>
                  Today
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCursor(new Date(Date.UTC(year, month - 1, 1)))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCursor(new Date(Date.UTC(year, month + 1, 1)))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-px overflow-hidden rounded-app border border-navy-900/10 bg-navy-900/10">
              {WEEKDAYS.map((day) => (
                <div key={day} className="bg-white px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-ink-400 sm:text-xs">
                  {day}
                </div>
              ))}

              {cells.map((date) => {
                const key = toKey(date)
                const dayEvents = eventsByDay.get(key) ?? []
                const inMonth = date.getUTCMonth() === month
                const isToday = key === todayKey
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={dayEvents.length === 0}
                    onClick={() => setSelectedDay(key)}
                    className={clsx(
                      'flex min-h-16 flex-col gap-1 p-1 text-left sm:min-h-20 sm:p-1.5',
                      inMonth ? 'bg-white' : 'bg-surface-muted/50',
                      isToday && 'ring-2 ring-inset ring-gold-400',
                      dayEvents.length > 0 ? 'cursor-pointer hover:bg-navy-50' : 'cursor-default'
                    )}
                  >
                    <span
                      className={clsx(
                        'text-[10px] font-semibold sm:text-xs',
                        isToday
                          ? 'flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-white'
                          : inMonth
                            ? 'text-ink-600'
                            : 'text-ink-400/60'
                      )}
                    >
                      {date.getUTCDate()}
                    </span>
                    <div className="hidden gap-1 md:flex md:flex-col">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEvent(event)
                          }}
                          className={clsx('truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight', CATEGORY_CHIP[event.category])}
                        >
                          {event.title}
                        </span>
                      ))}
                      {dayEvents.length > 3 && <span className="px-1 text-[10px] font-semibold text-ink-400">+{dayEvents.length - 3} more</span>}
                    </div>
                    {dayEvents.length > 0 && (
                      <span className="flex items-center gap-0.5 md:hidden">
                        <span className={clsx('h-1.5 w-1.5 rounded-full', CATEGORY_CHIP[dayEvents[0].category])} />
                        {dayEvents.length > 1 && <span className="text-[10px] font-semibold text-ink-400">{dayEvents.length}</span>}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {(Object.keys(CATEGORY_CHIP) as EventCategory[]).map((category) => (
                <span key={category} className="flex items-center gap-1.5 text-xs text-ink-600">
                  <span className={clsx('h-2.5 w-2.5 rounded-full', CATEGORY_CHIP[category])} /> {category}
                </span>
              ))}
            </div>
          </Card>

          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink-900">Upcoming Events</h2>
            <p className="mt-1 text-sm text-ink-600">Next few activities on the calendar</p>

            {upcoming.length === 0 && (
              <div className="mt-4">
                <EmptyState icon={<CalendarDays className="h-10 w-10" />} title="No upcoming events" subtitle="Check back soon for the next school or org activity." />
              </div>
            )}

            <div className="mt-4 space-y-3">
              {upcoming.map((event) => (
                <Card key={event.id} className="cursor-pointer p-4" onClick={() => setSelectedEvent(event)}>
                  <Badge tone={CATEGORY_TONE[event.category]}>{event.category}</Badge>
                  <p className="mt-2 font-bold leading-snug text-ink-900">{event.title}</p>
                  <p className="mt-1 text-xs text-ink-400">{formatDate(event.startDate)}</p>
                  {event.location && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-600">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedDay && (
        <DayModal
          dayKey={selectedDay}
          events={selectedDayEvents}
          onClose={() => setSelectedDay(null)}
          onSelectEvent={(event) => {
            setSelectedDay(null)
            setSelectedEvent(event)
          }}
        />
      )}

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}

function nextKey(dayKey: string): string {
  const date = dayKeyToUTC(dayKey)
  date.setUTCDate(date.getUTCDate() + 1)
  return toKey(date)
}

function DayModal({
  dayKey,
  events,
  onClose,
  onSelectEvent,
}: {
  dayKey: string
  events: ScheduledEvent[]
  onClose: () => void
  onSelectEvent: (event: ScheduledEvent) => void
}) {
  return (
    <Modal title={formatDate(dayKey)} onClose={onClose}>
      <div className="space-y-3">
        {events.length === 0 && <p className="text-sm text-ink-400">No events on this day.</p>}
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelectEvent(event)}
            className="w-full rounded-app border border-navy-900/10 bg-surface p-4 text-left transition-colors hover:bg-navy-50"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-ink-900">{event.title}</p>
              <Badge tone={CATEGORY_TONE[event.category]}>{event.category}</Badge>
            </div>
            {event.startTime && (
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                <Clock className="h-3 w-3" /> {event.startTime}
                {event.endTime && ` – ${event.endTime}`}
              </p>
            )}
            {event.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                <MapPin className="h-3 w-3" /> {event.location}
              </p>
            )}
          </button>
        ))}
      </div>
    </Modal>
  )
}

function EventModal({ event, onClose }: { event: ScheduledEvent; onClose: () => void }) {
  const dateRange =
    event.endDate && event.endDate !== event.startDate
      ? `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`
      : formatDate(event.startDate)

  return (
    <Modal title="Event Details" onClose={onClose}>
      <div>
        {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="mb-4 h-44 w-full rounded-app object-cover" />}
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-lg font-extrabold text-ink-900">{event.title}</h4>
          <Badge tone={CATEGORY_TONE[event.category]}>{event.category}</Badge>
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-ink-600">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-navy-900" /> {dateRange}
          </p>
          {event.startTime && (
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-navy-900" />
              {event.startTime}
              {event.endTime && ` – ${event.endTime}`}
            </p>
          )}
          {event.location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-navy-900" /> {event.location}
            </p>
          )}
        </div>
        {event.description && <p className="mt-4 text-sm leading-relaxed text-ink-600">{event.description}</p>}
      </div>
    </Modal>
  )
}
