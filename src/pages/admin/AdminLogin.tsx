import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@/components/ui/Primitives'
import { Field, Input } from '@/components/ui/Form'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminLogin() {
  const { isAdmin, login } = useAdminAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  if (isAdmin) return <Navigate to="/admin" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    const ok = await login(passcode || email, name || 'Admin')
    if (!ok) {
      setError('Incorrect passcode or email. Use the demo passcode or a valid Supabase email.')
      return
    }

    if (email) {
      setMessage('Check your inbox for the sign-in link to finish access.')
      return
    }

    setMessage('Signed in successfully.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center gap-1.5 text-sm font-medium text-navy-100/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to portal
        </Link>
        <Card className="p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-100 text-navy-900">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-ink-900">Admin Sign In</h1>
          <p className="mt-1 text-sm text-ink-600">Manage officers, promises, budget, and more.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Your Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria Santos" />
            </Field>
            <Field label="Admin Email (optional for magic link)">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@school.edu"
              />
            </Field>
            <Field label="Demo Passcode (optional fallback)">
              <Input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            {error && <p className="text-sm text-danger-600">{error}</p>}
            {message && <p className="text-sm text-success-600">{message}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <p className="mt-4 text-center text-xs text-ink-400">
            Use an email for a Supabase magic link, or the demo passcode for local testing.
          </p>
        </Card>
      </div>
    </div>
  )
}
