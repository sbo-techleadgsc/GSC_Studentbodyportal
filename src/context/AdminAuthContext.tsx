// ─────────────────────────────────────────────────────────────
// DEMO ADMIN AUTH — replace with Supabase Auth when you connect
// a real backend. See README.md "Connecting Supabase" section.
//
// Today: a single shared admin passcode stored in this file,
// session flag kept in localStorage.
// Later: supabase.auth.signInWithOAuth({ provider: 'google' })
//        restricted to your @gsc.edu.ph domain, or a magic link.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

const DEMO_PASSCODE = 'gsc-sbo-2026' // change this, then tell your officers
const SESSION_KEY = 'sbo_admin_session'

interface AdminAuthValue {
  isAdmin: boolean
  isAuthenticated: boolean
  adminName: string | null
  login: (passcode: string, name: string) => Promise<boolean>
  requestMagicLink: (email: string, name?: string) => Promise<boolean>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminName, setAdminName] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setIsAdmin(true)
      setIsAuthenticated(true)
      setAdminName(parsed.name)
    }

    if (!supabase) return

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const session = data.session
      if (session) {
        setIsAdmin(true)
        setIsAuthenticated(true)
        setAdminName(session.user.email ?? 'Admin')
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setIsAuthenticated(Boolean(session))
      setIsAdmin(Boolean(session))
      setAdminName(session?.user?.email ?? null)
      if (!session) localStorage.removeItem(SESSION_KEY)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (passcode: string, name: string) => {
    const normalized = passcode.trim()
    if (!normalized) return false

    if (supabase) {
      const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
      if (looksLikeEmail) {
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
        const { error } = await supabase.auth.signInWithOtp({
          email: normalized,
          options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        })

        if (!error) {
          setIsAuthenticated(true)
          setAdminName(name || normalized)
          return true
        }
      }
    }

    if (normalized === DEMO_PASSCODE) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ name: name || 'Admin' }))
      setIsAdmin(true)
      setIsAuthenticated(true)
      setAdminName(name || 'Admin')
      return true
    }

    return false
  }

  const requestMagicLink = async (email: string, name?: string) => {
    const normalized = email.trim()
    if (!normalized || !normalized.includes('@')) return false

    if (supabase) {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      })

      if (!error) {
        setIsAuthenticated(true)
        setAdminName(name || normalized)
        return true
      }
    }

    return false
  }

  const logout = () => {
    if (supabase) {
      void supabase.auth.signOut()
    }
    localStorage.removeItem(SESSION_KEY)
    setIsAdmin(false)
    setIsAuthenticated(false)
    setAdminName(null)
  }

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isAuthenticated, adminName, login, requestMagicLink, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
