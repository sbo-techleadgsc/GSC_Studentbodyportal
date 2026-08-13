// ─────────────────────────────────────────────────────────────
// ADMIN AUTH — backed by Supabase Auth + an `admins` allowlist
// table. Being logged in is NOT the same as being an admin:
// isAuthenticated = "has a valid Supabase session"
// isAdmin         = "that session's user_id is in the admins table"
// Only isAdmin should ever gate admin routes/actions.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminAuthValue {
  isAdmin: boolean
  isAuthenticated: boolean
  adminName: string | null
  login: (email: string, password: string) => Promise<boolean>
  requestMagicLink: (email: string) => Promise<boolean>
  signUpPublicUser: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminName, setAdminName] = useState<string | null>(null)

  // The ONLY place that decides isAdmin. Always re-checks against
  // Supabase — never trusts anything cached in the browser.
  async function applySession(session: import('@supabase/supabase-js').Session | null) {
    if (!session || !supabase) {
      setIsAuthenticated(false)
      setIsAdmin(false)
      setAdminName(null)
      return
    }

    setIsAuthenticated(true)

    const { data: adminRow, error } = await supabase
      .from('admins')
      .select('name, email')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('[AdminAuthContext] admin check failed:', error.message)
      setIsAdmin(false)
      setAdminName(session.user.email ?? null)
      return
    }

    setIsAdmin(Boolean(adminRow))
    setAdminName(adminRow?.name || session.user.email?.split('@')[0] || session.user.email || null)
  }

  useEffect(() => {
    if (!supabase) return
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) applySession(data.session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) applySession(session)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!supabase) return false
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    })
    if (error) {
      console.error('[login] Error:', error.message)
      return false
    }
    // onAuthStateChange fires automatically and calls applySession —
    // no manual state-setting here, so nothing can shortcut the admin check.
    return true
  }

  const requestMagicLink = async (email: string) => {
    if (!supabase) return false
    const normalized = email.trim()
    if (!normalized.includes('@')) return false

    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    })
    if (error) {
      console.error('[requestMagicLink] Error:', error.message)
      return false
    }
    return true
  }

  // Public sign-up creates a real, authenticated Supabase account —
  // but it will NEVER be an admin unless you add them to the admins
  // table yourself. isAdmin is derived fresh by applySession(), not
  // set here.
  const signUpPublicUser = async (email: string, password: string) => {
    if (!supabase) return false
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    })
    if (error) {
      console.error('[signUpPublicUser] Error:', error.message)
      return false
    }
    return true
  }

  const logout = () => {
    if (supabase) void supabase.auth.signOut()
    setIsAuthenticated(false)
    setIsAdmin(false)
    setAdminName(null)
  }

  return (
    <AdminAuthContext.Provider
      value={{ isAdmin, isAuthenticated, adminName, login, requestMagicLink, signUpPublicUser, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}