import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { budgetDb, pollsDb } from '@/lib/store'
import { siteConfig } from '@/config/site'
import { peso } from '@/lib/format'

const DONUT_COLORS = ['#0a2463', '#eceef5']

export default function Budget() {
  const [budget] = useLiveData(budgetDb.list)
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)

  const totals = useMemo(() => {
    const allocated = budget?.reduce((s, b) => s + b.allocated, 0) ?? 0
    const spent = budget?.reduce((s, b) => s + b.spent, 0) ?? 0
    return { allocated, spent, pct: allocated ? Math.round((spent / allocated) * 100) : 0 }
  }, [budget])

  const donutData = [
    { name: 'Spent', value: totals.spent },
    { name: 'Remaining', value: Math.max(totals.allocated - totals.spent, 0) },
  ]

  const barData = useMemo(
    () =>
      [...(budget ?? [])]
        .sort((a, b) => b.spent - a.spent)
        .map((b) => ({ name: b.category, Spent: b.spent })),
    [budget]
  )

  return (
    <div>
      <PageHero
        title="Budget"
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Budget Tracker</h2>
        <p className="mt-1.5 font-thin text-ink-600">{siteConfig.academicYear} Student Organization Fund</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <p className="text-sm text-ink-600">Total Budget</p>
            <p className="mt-1 text-3xl font-extrabold text-ink-900">{peso(totals.allocated)}</p>
            <p className="mt-1 text-xs text-ink-400">Annual allocation</p>
          </Card>
          <Card className="bg-navy-900 p-6">
            <p className="text-sm text-navy-100/70">Total Spent</p>
            <p className="mt-1 text-3xl font-extrabold text-white">{peso(totals.spent)}</p>
            <p className="mt-1 text-xs text-navy-100/60">{totals.pct}% utilized</p>
          </Card>
        </div>

        <Card className="mt-6 p-6">
          <p className="font-bold text-ink-900">Overall Utilization</p>
          <p className="mt-1 text-sm text-ink-600">{totals.pct}% of annual budget used</p>
          <div className="relative mx-auto mt-4 h-56 w-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none">
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-navy-900">{totals.pct}%</span>
              <span className="text-xs text-ink-400">used</span>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <p className="font-bold text-ink-900">Spending by Category</p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 12, fill: '#4a5578' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f3f5fc' }}
                  formatter={(v) => peso(Number(v))}
                  contentStyle={{ borderRadius: 12, border: '1px solid #eceef5', fontSize: 12 }}
                />
                <Bar dataKey="Spent" fill="#0a2463" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          {budget?.map((b) => {
            const pct = b.allocated ? Math.round((b.spent / b.allocated) * 100) : 0
            return (
              <Card key={b.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink-900">{b.category}</p>
                  <p className="text-sm text-ink-400">
                    {peso(b.spent)} / {peso(b.allocated)}
                  </p>
                </div>
                {b.description && <p className="mt-1 text-sm text-ink-600">{b.description}</p>}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
