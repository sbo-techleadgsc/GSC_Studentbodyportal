import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Flag,
  Users,
  CheckSquare,
  DollarSign,
  Radio,
  Newspaper,
  CalendarDays,
  Vote,
  ShieldCheck,
  HeartHandshake,
  Scale,
  MessageSquare,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Button, Card, Badge, StatusPill } from '@/components/ui/Primitives'
import { siteConfig } from '@/config/site'
import { useLiveData } from '@/lib/hooks'
import { officersDb, promisesDb, budgetDb, newsDb, pollsDb, updatesDb, eventsDb } from '@/lib/store'
import { pesoCompact } from '@/lib/format'
import { formatDate, localDateKey } from '@/lib/format'
import gscLogo from '@/assets/personal_assets/gsc_log_full.svg'

const FEATURES = [
  { to: '/officials', icon: Users, title: 'Elected Officials', desc: 'Meet your student organization officers - their roles, backgrounds, and contact information.' },
  { to: '/promises', icon: CheckSquare, title: 'Promise Tracker', desc: 'Every campaign commitment, tracked from pending to completed, in the open.' },
  { to: '/budget', icon: DollarSign, title: 'Budget Transparency', desc: 'See exactly where the annual student org fund goes, category by category.' },
  { to: '/updates', icon: Radio, title: 'Live Updates', desc: 'Recent meetings, decisions, and org-wide announcements as they happen.' },
  { to: '/reports', icon: Flag, title: 'Student Reports', desc: 'Submit concerns publicly or anonymously, and track the status yourself.' },
  { to: '/news', icon: Newspaper, title: 'School News', desc: 'Official announcements straight from the student organization portal.' },
  { to: '/voting', icon: Vote, title: 'Public Voting', desc: 'Have a say on themes, events, and priorities - results shown live.' },
  { to: '/community', icon: MessageSquare, title: 'Community Wall', desc: 'Share your thoughts on the freedom wall - a space for positive expression and connection.' },
]

const VALUES = [
  { icon: ShieldCheck, title: 'Transparency', desc: 'Every peso and every decision is visible to the students who fund it.' },
  { icon: Scale, title: 'Accountability', desc: 'Elected officials are held to what they campaigned on. Progress is tracked and visible to everyone.' },
  { icon: HeartHandshake, title: 'Participation', desc: 'Students are not just observers. Every report filed and every vote cast shapes how this org runs.' },
]

export default function Home() {
  const [officers] = useLiveData(officersDb.list)
  const [promises] = useLiveData(promisesDb.list)
  const [budget] = useLiveData(budgetDb.list)
  const [news] = useLiveData(newsDb.list)
  const [polls] = useLiveData(pollsDb.list)
  const [updates] = useLiveData(updatesDb.list)
  const [events] = useLiveData(eventsDb.list)

  const totalBudget = budget?.reduce((s, b) => s + b.allocated, 0) ?? 0
  const activePromises = promises?.filter((p) => p.status !== 'completed').length ?? 0
  const openPolls = polls?.filter((p) => p.isOpen) ?? []
  const featuredPoll = openPolls[0]
  const featuredPollTotal = featuredPoll?.options.reduce((s, o) => s + o.votes, 0) ?? 0
  const todayKey = localDateKey()
  const upcomingEvents = (events ?? [])
    .filter((e) => !e.endDate || e.endDate >= todayKey)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 2)

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 mt-4 sm:mt-6"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[1px] rounded-3xl"
          style={{ backgroundImage: `url(${gscLogo})` }}
        >
          <div className="absolute inset-0 bg-navy-900/65 rounded-3xl" />
        </div>
        <div className="cross-emblem pointer-events-none absolute -right-16 -top-10 h-96 w-96 bg-white/[0.05] sm:h-[28rem] sm:w-[28rem]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-12 sm:pb-20 sm:pt-16">
          <div className="max-w-3xl">
            <div className="inline-flex flex-col rounded-[1.6rem] border border-white/15 bg-white/10 px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md sm:px-6 sm:py-5">
              <LiveBadge>Official Student Organization Portal &middot; {siteConfig.academicYear}</LiveBadge>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {siteConfig.schoolName}
                <br />
                <span className="text-gold-400">{siteConfig.orgName}</span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-navy-100/80 sm:text-base">
                {siteConfig.tagline}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link to="/officials" className="w-full sm:w-[calc(50%-0.5rem)]">
                <Button
                  variant="secondary"
                  className="w-full justify-between rounded-[1.15rem] border border-white/20 bg-white/15 px-4 py-3.5 text-white shadow-[0_10px_25px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25"
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Meet the Officials
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/reports" className="w-full sm:w-[calc(50%-0.5rem)]">
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-[1.15rem] border border-white/30 !bg-white/20 px-4 py-3.5 !text-white shadow-[0_10px_25px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:!bg-white/30"
                >
                  <span className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    File a Report
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-6xl px-6 mx-4 sm:mx-6 lg:mx-auto"
      >
        {/* ── At a glance dashboard ────────────────────────── */}
        <section className="py-14 sm:py-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">At a Glance</h2>
          <p className="mt-2 text-ink-600">The latest from your student government, updated live.</p>

          <div className="mt-8 grid gap-5 responsive-grid sm:grid-cols-2 lg:grid-cols-4">
            {/* Upcoming events */}
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ink-900">Upcoming Events</p>
                <Link to="/events" className="text-xs font-semibold text-navy-900 hover:underline">View calendar</Link>
              </div>
              <div className="mt-4 space-y-4">
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-ink-400">No events on the calendar yet.</p>
                )}
                {upcomingEvents.map((e) => (
                  <div key={e.id} className="border-t border-navy-900/5 pt-4 first:border-0 first:pt-0">
                    <Badge tone={e.category === 'School' ? 'navy' : e.category === 'Organization' ? 'gold' : 'success'}>{e.category}</Badge>
                    <p className="mt-2 text-sm font-semibold leading-snug text-ink-900">{e.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
                      <CalendarDays className="h-3 w-3" /> {formatDate(e.startDate)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Latest news */}
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ink-900">Latest News</p>
                <Link to="/news" className="text-xs font-semibold text-navy-900 hover:underline">See all</Link>
              </div>
              <div className="mt-4 space-y-4">
                {news?.slice(0, 2).map((n) => (
                  <div key={n.id} className="border-t border-navy-900/5 pt-4 first:border-0 first:pt-0">
                    <Badge tone="navy">{n.category}</Badge>
                    <p className="mt-2 text-sm font-semibold leading-snug text-ink-900">{n.title}</p>
                    <p className="mt-1 text-xs text-ink-400">{formatDate(n.date)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent updates */}
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ink-900">Recent Updates</p>
                <Link to="/updates" className="text-xs font-semibold text-navy-900 hover:underline">See all</Link>
              </div>
              <div className="mt-4 space-y-4">
                {updates?.slice(0, 2).map((u) => (
                  <div key={u.id} className="border-t border-navy-900/5 pt-4 first:border-0 first:pt-0">
                    <Badge tone="gold">{u.category}</Badge>
                    <p className="mt-2 text-sm font-semibold leading-snug text-ink-900">{u.title}</p>
                    <p className="mt-1 text-xs text-ink-400">{formatDate(u.date)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Featured open poll */}
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ink-900">Open Poll</p>
                <Link to="/voting" className="text-xs font-semibold text-navy-900 hover:underline">Vote now</Link>
              </div>
              {featuredPoll ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold leading-snug text-ink-900">{featuredPoll.question}</p>
                  <div className="mt-4 space-y-2.5">
                    {featuredPoll.options.slice(0, 3).map((o) => {
                      const pct = featuredPollTotal ? Math.round((o.votes / featuredPollTotal) * 100) : 0
                      return (
                        <div key={o.id}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-ink-600">{o.label}</span>
                            <span className="text-ink-400">{pct}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                            <div className="h-full rounded-full bg-navy-900" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-400">No open polls right now.</p>
              )}
            </Card>
          </div>

          {/* Recently completed promise */}
          {promises?.some((p) => p.status === 'completed') && (
            <div className="mt-5">
              <Card className="p-6 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-bold text-ink-900">Delivered Recently</p>
                  <Link to="/promises" className="text-xs font-semibold text-navy-900 hover:underline">View promise tracker</Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {promises
                    .filter((p) => p.status === 'completed')
                    .slice(0, 2)
                    .map((p) => (
                      <div key={p.id} className="rounded-2xl bg-success-100/50 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-ink-900">{p.title}</p>
                          <StatusPill status="completed" />
                        </div>
                        {p.impactNote && <p className="mt-1.5 text-xs text-ink-600">{p.impactNote}</p>}
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}
        </section>

        {/* ── What this portal offers ─────────────────────── */}
        <section className="py-14 sm:py-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">What This Portal Offers</h2>
          <p className="mt-2 max-w-xl text-ink-600">Eight dedicated sections - everything about your student government, in one place.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 responsive-grid">
            {FEATURES.map(({ to, icon: Icon, title, desc }) => (
              <Link key={to} to={to}>
                <Card className="group h-full p-6 transition-transform hover:-translate-y-0.5 rounded-2xl">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-100 text-navy-900 transition-colors group-hover:bg-navy-900 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-bold text-ink-900">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Values ───────────────────────────────────────── */}
        <section className="pb-14 sm:pb-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6 rounded-2xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-bold text-ink-900">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Quick stats ──────────────────────────────────── */}
        <section className="pb-14 sm:pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard value={String(officers?.length ?? '—')} label="Elected Officers" />
            <StatCard value={String(activePromises)} label="Active Promises" />
            <StatCard value={pesoCompact(totalBudget)} label="Annual Budget" />
            <StatCard value={String(openPolls.length)} label="Open Polls" />
          </div>
        </section>
      </motion.div>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card className="p-6 text-center rounded-2xl">
      <p className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-ink-600">{label}</p>
    </Card>
  )
}
