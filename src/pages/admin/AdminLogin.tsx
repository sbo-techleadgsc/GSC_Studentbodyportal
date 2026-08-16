import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@/components/ui/Primitives'
import { Field, Input } from '@/components/ui/Form'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminLogin() {
  const { isAdmin, login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  if (isAdmin) return <Navigate to="/admin" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    const err = await login(email, password)
    if (err) {
      setError(`Sign-in failed: ${err}`)
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
            <Field label="Admin Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@school.edu"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            {error && <p className="text-sm text-danger-600">{error}</p>}
            {message && <p className="text-sm text-success-600">{message}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <p className="mt-4 text-center text-xs text-ink-400">
            Sign in with your Supabase admin email and password.
          </p>
        </Card>
      </div>
    </div>
  )
}
