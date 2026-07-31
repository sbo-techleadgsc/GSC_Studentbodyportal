import { useState, type FormEvent } from 'react'
import { Eye, Lock, Search, CheckCircle2 } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card, Button, StatusPill } from '@/components/ui/Primitives'
import { Field, Input, Textarea, Select } from '@/components/ui/Form'
import { useLiveData } from '@/lib/hooks'
import { reportsDb, pollsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { clsx } from '@/lib/clsx'
import type { Report } from '@/lib/types'

const CATEGORIES = ['Facilities', 'Academic Support', 'Safety', 'Finance/Fees', 'Bullying/Conduct', 'Other']

export default function Reports() {
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)

  const [visibility, setVisibility] = useState<'public' | 'anonymous'>('public')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState<Report | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!category || !content.trim()) return
    setSubmitting(true)
    const report = await reportsDb.submit({
      visibility,
      fullName: visibility === 'public' ? fullName : undefined,
      email: visibility === 'public' ? email : undefined,
      category,
      content,
    })
    setSubmitting(false)
    setSubmitted(report)
    setFullName('')
    setEmail('')
    setCategory('')
    setContent('')
  }

  return (
    <div>
      <PageHero
        title="Reports"
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Student Report Form</h2>
            <p className="mt-1.5 text-ink-600">Submit concerns, feedback, or grievances confidentially.</p>

            {submitted ? (
              <Card className="mt-6 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-100 text-success-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-ink-900">Report submitted</p>
                    <p className="text-sm text-ink-600">Save this tracking code to check its status anytime.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-app bg-navy-50 px-4 py-3 text-center">
                  <p className="font-mono text-lg font-bold tracking-wide text-navy-900">{submitted.trackingCode}</p>
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={() => setSubmitted(null)}>
                  Submit another report
                </Button>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="inline-flex rounded-app bg-surface-muted p-1">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-[calc(var(--radius-app)-0.25rem)] px-4 py-2 text-sm font-semibold transition-colors',
                      visibility === 'public' ? 'bg-white text-navy-900 shadow-sm' : 'text-ink-600'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" /> Public Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('anonymous')}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-[calc(var(--radius-app)-0.25rem)] px-4 py-2 text-sm font-semibold transition-colors',
                      visibility === 'anonymous' ? 'bg-white text-navy-900 shadow-sm' : 'text-ink-600'
                    )}
                  >
                    <Lock className="h-3.5 w-3.5" /> Anonymous Report
                  </button>
                </div>

                {visibility === 'public' && (
                  <>
                    <Field label="Full Name">
                      <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                    </Field>
                    <Field label="School Email">
                      <Input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gsc.edu.ph"
                      />
                    </Field>
                  </>
                )}

                <Field label="Category">
                  <Select required value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="What's going on?" hint="Be as specific as you can - location, time, people involved if relevant.">
                  <Textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your concern..."
                  />
                </Field>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>

                {visibility === 'anonymous' && (
                  <p className="text-center text-xs text-ink-400">
                    Your name and email are never collected for anonymous reports.
                  </p>
                )}
              </form>
            )}
          </div>

          <TrackStatusCard />
        </div>
      </div>
    </div>
  )
}

function TrackStatusCard() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<Report | null | undefined>(undefined)

  async function check() {
    const found = await reportsDb.findByTrackingCode(code)
    setResult(found ?? null)
  }

  return (
    <Card className="p-5">
      <p className="font-bold text-ink-900">Check a Report</p>
      <p className="mt-1 text-sm text-ink-600">Have a tracking code? See its current status.</p>
      <div className="mt-3 flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="REPORT-1234"
          className="text-sm"
        />
        <Button variant="secondary" onClick={check} className="shrink-0 !px-3">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {result !== undefined && (
        <div className="mt-4 border-t border-navy-900/5 pt-4">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-900">{result.trackingCode}</span>
                <StatusPill status={result.status} />
              </div>
              <p className="mt-1 text-xs text-ink-400">Filed {formatDate(result.createdAt)}</p>
              {result.adminNotes && <p className="mt-2 text-xs text-ink-600">{result.adminNotes}</p>}
            </>
          ) : (
            <p className="text-sm text-ink-400">No report found with that code.</p>
          )}
        </div>
      )}
    </Card>
  )
}
