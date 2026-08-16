import { useState, type FormEvent } from 'react'
import { Lock, Search, CheckCircle2, AlertTriangle, User } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Card, Button, StatusPill } from '@/components/ui/Primitives'
import { Field, Input, Textarea, Select } from '@/components/ui/Form'
import { CrisisModal } from '@/components/ui/CrisisModal'
import { useLiveData } from '@/lib/hooks'
import { reportsDb, pollsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { clsx } from '@/lib/clsx'
import { shouldTriggerCrisisInterceptor } from '@/lib/crisisDetection'
import { STUDENT_ID_FORMAT, STUDENT_ID_PLACEHOLDER, isValidStudentId, normalizeStudentId } from '@/lib/studentId'
import type { Report, ReportCategory, ContactMethod } from '@/lib/types'

const SENSITIVE_CATEGORIES: ReportCategory[] = ['campus-whistleblowing', 'mental-health']

const ALL_CATEGORIES: ReportCategory[] = [
  'direct-inquiry',
  'lost-found',
  'individual-complaint',
  'administrative-followup',
  'broken-facilities',
  'event-feedback',
  'campus-whistleblowing',
  'mental-health',
  'other',
]

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  'direct-inquiry': 'Direct Inquiry',
  'lost-found': 'Lost & Found',
  'individual-complaint': 'Individual Complaint',
  'administrative-followup': 'Administrative Follow-up',
  'broken-facilities': 'Broken Facilities',
  'event-feedback': 'Event Feedback/Suggestions',
  'campus-whistleblowing': 'Campus Whistleblowing',
  'mental-health': 'Mental Health / Peer Distress',
  'other': 'Other',
}

const CATEGORY_HINTS: Partial<Record<ReportCategory, string>> = {
  'campus-whistleblowing': 'Covers corruption, misconduct, or policy violations within the student organization.',
  'mental-health': 'Covers personal distress, peer concerns, or welfare matters you want to raise.',
  'broken-facilities': 'Covers damaged school facilities and equipment.',
  'event-feedback': 'Feedback or suggestions about events and school programs.',
}

const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  email: 'Personal Email (Gmail/Yahoo)',
  messenger: 'FB Messenger Link/Handle',
  sms: 'Mobile/SMS Number',
}

export default function Reports() {
  const [polls] = useLiveData(pollsDb.list)
  const openPoll = polls?.find((p) => p.isOpen)

  const [visibility, setVisibility] = useState<'public' | 'anonymous'>('public')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [section, setSection] = useState('')
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email')
  const [contactValue, setContactValue] = useState('')
  const [category, setCategory] = useState<ReportCategory | ''>('')
  const [content, setContent] = useState('')
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [submitted, setSubmitted] = useState<Report | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const isSensitive = category !== '' && SENSITIVE_CATEGORIES.includes(category)
  const isAnonymous = isSensitive && visibility === 'anonymous'

  function handleCategoryChange(value: ReportCategory) {
    setCategory(value)
    // Sensitive categories can be anonymous; everything else is public
    if (!SENSITIVE_CATEGORIES.includes(value)) setVisibility('public')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError(null)
    setSubmitError(null)

    // Crisis detection
    if (shouldTriggerCrisisInterceptor(content, category)) {
      setShowCrisisModal(true)
      return
    }

    if (!category || !content.trim()) {
      setValidationError('Please fill in all required fields')
      return
    }

    if (isAnonymous) {
      if (!disclaimerAccepted) {
        setValidationError('Please accept the anonymous report disclaimer')
        return
      }
    } else {
      if (!fullName.trim()) {
        setValidationError('Please enter your full name')
        return
      }
      if (!studentId.trim()) {
        setValidationError('Please enter your Student ID')
        return
      }
      if (!isValidStudentId(studentId)) {
        setValidationError(`Student ID must be in format: ${STUDENT_ID_FORMAT} (e.g., 00-00000)`)
        return
      }
      if (!section.trim()) {
        setValidationError('Please enter your section')
        return
      }
      if (!contactValue.trim()) {
        setValidationError('Please enter your contact information')
        return
      }
    }

    setSubmitting(true)

    try {
      const report = await reportsDb.submit({
        visibility: isAnonymous ? 'anonymous' : 'public',
        fullName: isAnonymous ? undefined : fullName,
        email: !isAnonymous && contactMethod === 'email' ? contactValue : undefined,
        studentId: isAnonymous ? undefined : normalizeStudentId(studentId),
        section: isAnonymous ? undefined : section,
        contactMethod: isAnonymous ? undefined : contactMethod,
        contactValue: isAnonymous ? undefined : contactValue,
        category,
        content,
        isAnonymous,
        disclaimerAccepted: isAnonymous ? disclaimerAccepted : true,
      })
      setSubmitted(report)
      // Reset form
      setVisibility('public')
      setFullName('')
      setStudentId('')
      setSection('')
      setContactMethod('email')
      setContactValue('')
      setCategory('')
      setContent('')
      setDisclaimerAccepted(false)
    } catch (error) {
      setSubmitted(null)
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit report right now.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleContinuePastCrisisModal() {
    setShowCrisisModal(false)
    // Allow submission to proceed
  }

  return (
    <div>
      <PageHero
        title="Reports"
        badge={openPoll && <LiveBadge>Voting open &middot; {openPoll.question}</LiveBadge>}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Student Report Form</h2>
            <p className="mt-1.5 font-thin text-ink-600">Submit concerns, feedback, or grievances confidentially.</p>

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
                <Field label="Category">
                  <Select value={category} onChange={(e) => handleCategoryChange(e.target.value as ReportCategory)}>
                    <option value="">Select a category</option>
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                        {SENSITIVE_CATEGORIES.includes(c) ? ' (sensitive)' : ''}
                      </option>
                    ))}
                  </Select>
                  {category && CATEGORY_HINTS[category] && (
                    <p className="mt-1 text-xs text-ink-500">{CATEGORY_HINTS[category]}</p>
                  )}
                </Field>

                {isSensitive && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">This category covers sensitive matters</p>
                    <p className="mt-1 text-xs text-amber-800">
                      You can submit with your identity for follow-up, or anonymously if you prefer.
                    </p>
                    <div className="mt-3 inline-flex rounded-app bg-white/70 p-1">
                      <button
                        type="button"
                        onClick={() => setVisibility('public')}
                        className={clsx(
                          'flex items-center gap-1.5 rounded-[calc(var(--radius-app)-0.25rem)] px-4 py-2 text-sm font-semibold transition-colors',
                          visibility === 'public' ? 'bg-white text-navy-900 shadow-sm' : 'text-ink-600'
                        )}
                      >
                        <User className="h-3.5 w-3.5" /> Submit with my info
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibility('anonymous')}
                        className={clsx(
                          'flex items-center gap-1.5 rounded-[calc(var(--radius-app)-0.25rem)] px-4 py-2 text-sm font-semibold transition-colors',
                          visibility === 'anonymous' ? 'bg-white text-navy-900 shadow-sm' : 'text-ink-600'
                        )}
                      >
                        <Lock className="h-3.5 w-3.5" /> Submit anonymously
                      </button>
                    </div>
                  </div>
                )}

                {isAnonymous ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="disclaimer"
                        checked={disclaimerAccepted}
                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                        className="mt-1"
                      />
                      <label htmlFor="disclaimer" className="text-sm text-ink-700">
                        <strong className="text-danger-700">Required:</strong> I understand that anonymous reports cannot be traced for emergency intervention.
                        If this is an emergency, I should contact campus security or emergency services directly.
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-navy-50 border border-navy-100 p-4">
                      <p className="text-sm font-semibold text-navy-900 mb-2">Identity Required</p>
                      <p className="text-xs text-navy-700">Your identity lets us follow up and respond to your report.</p>
                    </div>

                    <Field label="Full Name">
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </Field>

                    <Field label="Student ID">
                      <Input
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder={STUDENT_ID_PLACEHOLDER}
                        maxLength={8}
                      />
                      <p className="mt-1 text-xs text-ink-500">Format: {STUDENT_ID_FORMAT}</p>
                    </Field>

                    <Field label="Section">
                      <Input
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        placeholder="e.g., BS-Nursing-1A"
                      />
                    </Field>

                    <Field label="Preferred Contact Method">
                      <Select value={contactMethod} onChange={(e) => setContactMethod(e.target.value as ContactMethod)}>
                        <option value="email">{CONTACT_METHOD_LABELS.email}</option>
                        <option value="messenger">{CONTACT_METHOD_LABELS.messenger}</option>
                        <option value="sms">{CONTACT_METHOD_LABELS.sms}</option>
                      </Select>
                    </Field>

                    <Field label={CONTACT_METHOD_LABELS[contactMethod]}>
                      <Input
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        placeholder={
                          contactMethod === 'email' ? 'yourname@gmail.com' :
                          contactMethod === 'messenger' ? 'fb.com/yourname' :
                          '09XX XXX XXXX'
                        }
                      />
                    </Field>
                  </div>
                )}

                <Field label="What's going on?" hint="Be as specific as you can - location, time, people involved if relevant.">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your concern..."
                    rows={4}
                  />
                </Field>

                {validationError && (
                  <div className="rounded-app border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {validationError}
                  </div>
                )}

                {submitError && (
                  <div className="rounded-app border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {submitError}
                  </div>
                )}

                {/* Disciplinary Disclaimer Banner */}
                <div className="rounded-lg bg-danger-50 border border-danger-200 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-danger-900">Academic Integrity Warning</p>
                      <p className="mt-1 text-xs text-danger-800">
                        Malicious spam, fake reports, and fraudulent submissions violate student conduct policies and will be escalated to the Guidance Office for disciplinary action.
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>

                {isAnonymous && (
                  <p className="text-center text-xs text-ink-400">
                    Your identity is never collected for anonymous reports.
                  </p>
                )}
              </form>
            )}
          </div>

          <TrackStatusCard />
        </div>
      </div>

      <CrisisModal 
        isOpen={showCrisisModal} 
        onClose={() => setShowCrisisModal(false)}
        onContinue={handleContinuePastCrisisModal}
      />
    </div>
  )
}

function TrackStatusCard() {
  const [code, setCode] = useState('')
  const [studentId, setStudentId] = useState('')
  const [result, setResult] = useState<Report | null | undefined>(undefined)

  async function check() {
    const found = await reportsDb.findByTrackingCodeAndStudentId(code, normalizeStudentId(studentId))
    setResult(found ?? null)
  }

  return (
    <Card className="p-5">
      <p className="font-bold text-ink-900">Check a Report</p>
      <p className="mt-1 text-sm text-ink-600">Enter your tracking code and Student ID to view status.</p>
      <div className="mt-3 space-y-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Tracking code (e.g., SBO-ABCD)"
          className="text-sm"
        />
        <Input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder={`Student ID (${STUDENT_ID_FORMAT})`}
          className="text-sm"
        />
        <Button variant="secondary" onClick={check} className="w-full gap-2">
          <Search className="h-4 w-4" /> Check Status
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
              {result.adminReply && (
                <div className="mt-2 rounded-app bg-navy-50 px-3 py-2">
                  <p className="text-xs text-ink-600">
                    <span className="font-semibold">SBO Reply:</span> {result.adminReply}
                  </p>
                </div>
              )}
              {result.adminNotes && <p className="mt-2 text-xs text-ink-600">{result.adminNotes}</p>}
            </>
          ) : (
            <p className="text-sm text-ink-400">No report found with that code and Student ID.</p>
          )}
        </div>
      )}
    </Card>
  )
}
