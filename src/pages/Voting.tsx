import { useState, type FormEvent } from 'react'
import { Vote as VoteIcon, CheckCircle2, Users } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card, Badge, EmptyState } from '@/components/ui/Primitives'
import { Field, Input } from '@/components/ui/Form'
import { useLiveData } from '@/lib/hooks'
import { pollsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { clsx } from '@/lib/clsx'
import { useAdminAuth } from '@/context/AdminAuthContext'
import type { Poll } from '@/lib/types'

export default function Voting() {
  const [polls, reload] = useLiveData(pollsDb.list)
  const { isAuthenticated, requestMagicLink } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const openPolls = polls?.filter((p) => p.isOpen) ?? []
  const closedPolls = polls?.filter((p) => !p.isOpen) ?? []

  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!email.trim()) {
      setAuthError('Please enter your email to receive a sign-in link.')
      return
    }

    const ok = await requestMagicLink(email)
    if (!ok) {
      setAuthError('We could not send a sign-in link. Please try again.')
      return
    }

    setAuthMessage(`Check ${email} for your sign-in link.`)
  }

  return (
    <div>
      <PageHero
        title="Voting"
        badge={openPolls[0] && <LiveBadge>Voting open &middot; {openPolls[0].question}</LiveBadge>}
      />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Public Polls</h2>
        <p className="mt-1.5 text-ink-600">Cast your vote. Results update live, and a quick sign-in is required before your vote is counted.</p>

        {openPolls.length === 0 && (
          <div className="mt-8">
            <EmptyState icon={<VoteIcon className="h-10 w-10" />} title="No open polls right now" subtitle="Check back soon, or browse past results below." />
          </div>
        )}

        {!isAuthenticated && (
          <Card className="mt-8 p-6">
            <h3 className="text-base font-bold text-ink-900">Sign in to vote</h3>
            <p className="mt-1 text-sm text-ink-600">Use your email to receive a Supabase magic link, then return here to cast your vote.</p>
            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
              <Field label="Your email">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@school.edu" />
              </Field>
              {authError && <p className="text-sm text-danger-600">{authError}</p>}
              {authMessage && <p className="text-sm text-success-600">{authMessage}</p>}
              <button type="submit" className="rounded-app bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                Send sign-in link
              </button>
            </form>
          </Card>
        )}

        <div className="mt-8 space-y-5">
          {openPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} canVote={isAuthenticated} onRequireAuth={() => setAuthError('Please sign in with your email before voting.')} onVoted={reload} />
          ))}
        </div>

        {closedPolls.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-ink-900">Past Polls</h3>
            <div className="mt-4 space-y-4">
              {closedPolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} closed canVote={isAuthenticated} onRequireAuth={() => setAuthError('Please sign in with your email before voting.')} onVoted={reload} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PollCard({ poll, closed, canVote, onRequireAuth, onVoted }: { poll: Poll; closed?: boolean; canVote: boolean; onRequireAuth: () => void; onVoted: () => void }) {
  const [myVote, setMyVote] = useState<string | undefined>(pollsDb.getMyVote(poll.id))
  const total = poll.options.reduce((s, o) => s + o.votes, 0)

  async function vote(optionId: string) {
    if (!canVote) {
      onRequireAuth()
      return
    }
    if (myVote || closed) return
    const res = await pollsDb.vote(poll.id, optionId)
    if (res.ok) {
      setMyVote(optionId)
      onVoted()
    }
  }

  const showResults = closed || !!myVote

  return (
    <Card className={clsx('p-6', closed && 'opacity-80')}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-bold leading-snug text-ink-900">{poll.question}</p>
        <Badge tone={closed ? 'neutral' : 'success'}>{closed ? 'Closed' : 'Open'}</Badge>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
        <Users className="h-3.5 w-3.5" /> {total} vote{total === 1 ? '' : 's'} &middot;{' '}
        {closed ? `Closed ${formatDate(poll.endDate)}` : `Ends ${formatDate(poll.endDate)}`}
      </p>

      <div className="mt-4 space-y-2.5">
        {poll.options.map((opt) => {
          const pct = total ? Math.round((opt.votes / total) * 100) : 0
          const isMine = myVote === opt.id

          if (!showResults) {
            return (
              <button
                key={opt.id}
                onClick={() => vote(opt.id)}
                className="flex w-full items-center justify-between rounded-app border border-navy-900/10 px-4 py-3 text-left text-sm font-semibold text-ink-900 transition-colors hover:border-navy-900/30 hover:bg-navy-50"
              >
                {opt.label}
                <span className="text-xs font-normal text-ink-400">Tap to vote</span>
              </button>
            )
          }

          return (
            <div key={opt.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={clsx('flex items-center gap-1.5 font-medium', isMine ? 'text-navy-900' : 'text-ink-600')}>
                  {isMine && <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />}
                  {opt.label}
                </span>
                <span className="text-ink-400">{pct}% ({opt.votes})</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={clsx('h-full rounded-full transition-all', isMine ? 'bg-gold-500' : 'bg-navy-900')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {myVote && !closed && <p className="mt-3 text-xs font-medium text-success-600">You voted. Thanks for participating!</p>}
    </Card>
  )
}
