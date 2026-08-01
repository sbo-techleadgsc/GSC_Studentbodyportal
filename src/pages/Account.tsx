import { useState, type FormEvent, useEffect } from 'react'
import { User as UserIcon, LogOut, CheckCircle2, FileText, Search } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Card, Badge, EmptyState, StatusPill } from '@/components/ui/Primitives'
import { Field, Input } from '@/components/ui/Form'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useLiveData } from '@/lib/hooks'
import { reportsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Report } from '@/lib/types'

export default function Account() {
  const { isAuthenticated, adminName, signUpPublicUser, requestMagicLink, logout } = useAdminAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>([])

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
      })
    } else {
      setUserEmail(null)
      setReports([])
    }
  }, [isAuthenticated])

  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter your email and password.')
      return
    }

    const ok = await signUpPublicUser(email, password, name || undefined)
    if (!ok) {
      setAuthError('We could not sign you in. Please check your email and password, or try again later.')
      return
    }

    setAuthMessage(`Welcome ${name || email}! You can now vote and submit reports.`)
    // Clear form on success
    setName('')
    setEmail('')
    setPassword('')
  }

  function handleLogout() {
    logout()
    setAuthMessage('You have been signed out.')
    setAuthError('')
    setUserEmail(null)
    setReports([])
  }

  if (isAuthenticated) {
    return (
      <div>
        <PageHero
          title="Account"
          badge={<Badge tone="success">Signed in</Badge>}
        />

        <div className="mx-auto max-w-3xl px-6 py-10">
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

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Sign in or sign up</h2>
        <p className="mt-1.5 text-ink-600">Create an account to vote on polls and submit reports.</p>

        <Card className="mt-8 p-6">
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <Field label="Your name (optional)">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan dela Cruz" />
            </Field>
            <Field label="Your email">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@school.edu" />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            {authError && <p className="text-sm text-danger-600">{authError}</p>}
            {authMessage && (
              <div className="flex items-start gap-2 rounded-app bg-success-50 p-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success-600" />
                <p className="text-sm text-success-700">{authMessage}</p>
              </div>
            )}
            <button type="submit" className="w-full rounded-app bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
              Create account / sign in
            </button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-ink-500">
            By signing up, you agree to participate in GSC Student Council polls and reports.
          </p>
        </div>
      </div>
    </div>
  )
}
