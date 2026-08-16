import { useState, type FormEvent, useEffect } from 'react'
import { User as UserIcon, LogOut, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Card, Badge, EmptyState, StatusPill } from '@/components/ui/Primitives'
import { Field, Input } from '@/components/ui/Form'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useLiveData } from '@/lib/hooks'
import { reportsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { isEmailRegistered, isStudentIdTaken, registerStudentAccount } from '@/lib/studentRegistry'
import { STUDENT_ID_FORMAT, STUDENT_ID_PLACEHOLDER, isValidStudentId, normalizeStudentId } from '@/lib/studentId'
import type { Report } from '@/lib/types'

export default function Account() {
  const { isAuthenticated, adminName, signUpPublicUser, isAdminEmail, login, logout } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isAdminAccount, setIsAdminAccount] = useState(false)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userStudentId, setUserStudentId] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>([])

  // Detect admin emails so we can skip the Student ID field for them
  useEffect(() => {
    let active = true
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setIsAdminAccount(false)
      return
    }
    isAdminEmail(trimmed).then((isAdmin) => {
      if (active) setIsAdminAccount(isAdmin)
    })
    return () => {
      active = false
    }
  }, [email, isAdminEmail])

  // Detect whether the email already has an account → switch to Log in
  useEffect(() => {
    let active = true
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) return
    isEmailRegistered(trimmed).then((registered) => {
      if (!active) return
      setMode(registered ? 'login' : 'signup')
    })
    return () => {
      active = false
    }
  }, [email])

  // Get user email when authenticated
  useEffect(() => {
    if (isAuthenticated && supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setUserEmail(user.email)
          // Load user's reports
          reportsDb.findByEmail(user.email).then((userReports) => {
            setReports(userReports)
          })
        }
        const meta = user?.user_metadata as { student_id?: string } | undefined
        setUserStudentId(meta?.student_id ?? null)
      })
    } else {
      setUserEmail(null)
      setUserStudentId(null)
      setReports([])
    }
  }, [isAuthenticated])

  function handleLogout() {
    logout()
    setAuthMessage('You have been signed out.')
    setAuthError('')
    setUserEmail(null)
    setUserStudentId(null)
    setReports([])
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter your email and password.')
      return
    }

    const err = await login(email, password)
    if (err) {
      setAuthError(`Sign-in failed: ${err}`)
      return
    }

    setAuthMessage('Welcome back!')
    setPassword('')
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter your email and password.')
      return
    }
    if (!isAdminAccount) {
      if (!studentId.trim()) {
        setAuthError('Please enter your Student ID.')
        return
      }
      if (!isValidStudentId(studentId)) {
        setAuthError(`Student ID must be in format: ${STUDENT_ID_FORMAT} (e.g., 00-00000)`)
        return
      }
      const taken = await isStudentIdTaken(normalizeStudentId(studentId))
      if (taken) {
        setAuthError('This Student ID already has an account. Please log in instead.')
        return
      }
    }
    if (!termsAccepted) {
      setAuthError('Please accept the Terms & Conditions to create your account.')
      return
    }

    const { error, userId } = await signUpPublicUser(email, password, isAdminAccount ? undefined : normalizeStudentId(studentId))
    if (error) {
      if (/already registered/i.test(error)) {
        setAuthError('An account already exists for this email. Please log in instead.')
        setMode('login')
      } else {
        setAuthError(`Sign-up failed: ${error}`)
      }
      return
    }

    if (userId && !isAdminAccount) await registerStudentAccount(normalizeStudentId(studentId), userId)

    setAuthMessage('Account created! You can now vote and submit reports.')
    // Clear form on success
    setEmail('')
    setPassword('')
    setStudentId('')
    setTermsAccepted(false)
    setMode('signup')
  }

  if (isAuthenticated) {
    return (
      <div>
        <PageHero
          title="Account"
          badge={<Badge tone="success">Signed in</Badge>}
        />

        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100">
                  <UserIcon className="h-6 w-6 text-navy-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink-900">
                    {adminName || 'User'}
                  </h3>
                  <p className="text-sm text-ink-600">{userEmail || 'No email'}</p>
                  {userStudentId && (
                    <p className="mt-0.5 text-xs font-mono text-ink-400">Student ID: {userStudentId}</p>
                  )}
                  <p className="text-xs text-ink-400 mt-1">You can vote on polls and submit reports</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-app border border-navy-900/10 px-3 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-navy-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </Card>

          {authMessage && (
            <div className="mt-4 rounded-app bg-success-50 p-4">
              <p className="text-sm font-medium text-success-700">{authMessage}</p>
            </div>
          )}

          {/* User's Reports Section */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Reports
            </h3>
            <p className="mt-1 text-sm text-ink-600">Track the status of your submitted reports</p>

            {reports.length === 0 ? (
              <div className="mt-4">
                <EmptyState 
                  icon={<FileText className="h-10 w-10" />} 
                  title="No reports yet" 
                  subtitle="Submit a report to track its status here." 
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {reports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-navy-900">{report.trackingCode}</span>
                          <StatusPill status={report.status} />
                        </div>
                        <p className="mt-1 text-sm font-medium text-ink-900">{report.category}</p>
                        <p className="mt-1 text-xs text-ink-500 line-clamp-2">{report.content}</p>
                        <p className="mt-2 text-xs text-ink-400">Submitted {formatDate(report.createdAt)}</p>
                        {report.adminNotes && (
                          <div className="mt-2 rounded-app bg-navy-50 px-3 py-2">
                            <p className="text-xs text-ink-600">
                              <span className="font-semibold">Admin note:</span> {report.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHero title="Account" />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Sign in or sign up</h2>
        <p className="mt-1.5 font-thin text-ink-600">Create an account to vote on polls and submit reports.</p>

        <Card className="mt-8 p-6">
          <form onSubmit={(e) => {
            e.preventDefault()
            if (mode === 'login') void handleLogin(e)
            else void handleSignUp(e)
          }} className="space-y-4">
            <Field label="Your personal email" hint="Use the email you check regularly (e.g., Gmail or Yahoo)">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@gmail.com" />
            </Field>

            {mode === 'login' ? (
              <>
                {isAdminAccount && (
                  <div className="rounded-app border border-gold-500/40 bg-gold-50 p-3">
                    <p className="text-sm text-gold-900">Admin account detected &mdash; logging in.</p>
                  </div>
                )}
                <Field label="Password">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </Field>
              </>
            ) : (
              <>
                {isAdminAccount ? (
                  <div className="rounded-app border border-gold-500/40 bg-gold-50 p-3">
                    <p className="text-sm text-gold-900">Admin account detected &mdash; no Student ID needed.</p>
                  </div>
                ) : (
                  <Field label="Student ID" hint={`Format: ${STUDENT_ID_FORMAT}`}>
                    <Input
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder={STUDENT_ID_PLACEHOLDER}
                      maxLength={8}
                    />
                  </Field>
                )}
                <Field label="Password">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </Field>
              </>
            )}

            {authError && <p className="text-sm text-danger-600">{authError}</p>}
            {authMessage && (
              <div className="flex items-start gap-2 rounded-app bg-success-50 p-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success-600" />
                <p className="text-sm text-success-700">{authMessage}</p>
              </div>
            )}

            {mode === 'signup' && (
              <label className="flex cursor-pointer items-start gap-3 rounded-app border border-navy-900/10 bg-navy-50/50 p-4">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-gold-500"
                />
                <span className="text-xs leading-relaxed text-ink-600">
                  <span className="font-semibold text-ink-900">Terms &amp; Conditions:</span> I agree that my name, email, and
                  Student ID will be kept secure and confidential by The Axis Student Organization, and will only be used for
                  administrative purposes such as verifying my identity, processing my reports, and counting my votes. My
                  information will never be shared publicly without my consent.
                </span>
              </label>
            )}

            {mode === 'login' ? (
              <button type="submit" className="w-full rounded-app bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                Log in
              </button>
            ) : (
              <button type="submit" className="w-full rounded-app bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                Create account / sign up
              </button>
            )}

            <p className="text-center text-xs text-ink-500">
              {mode === 'login' ? (
                <>
                  New here?{' '}
                  <button type="button" onClick={() => setMode('signup')} className="font-semibold text-navy-900 hover:underline">
                    Sign up instead
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('login')} className="font-semibold text-navy-900 hover:underline">
                    Log in instead
                  </button>
                </>
              )}
            </p>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your information is kept safe and is only used for administrative reasons.
          </p>
        </div>
      </div>
    </div>
  )
}
