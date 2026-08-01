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

const SESSION_KEY = 'sbo_admin_session'

interface AdminAuthValue {
  isAdmin: boolean
  isAuthenticated: boolean
  adminName: string | null
  login: (email: string, password: string, name: string) => Promise<boolean>
  requestMagicLink: (email: string, name?: string) => Promise<boolean>
  signUpPublicUser: (email: string, password: string, name?: string) => Promise<boolean>
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
      try {
        const parsed = JSON.parse(saved)
        setIsAdmin(true)
        setIsAuthenticated(true)
        setAdminName(parsed.name)
      } catch (e) {
        console.error('[AdminAuthContext] Failed to parse saved session', e)
        localStorage.removeItem(SESSION_KEY)
      }
    }

    if (!supabase) return

    let active = true

    // Check initial session
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const session = data.session
      if (session) {
        setIsAdmin(true)
        setIsAuthenticated(true)
        setAdminName(session.user.email ?? 'Admin')
        // Also save to localStorage for persistence
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: session.user.email ?? 'Admin' }))
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      console.log('[AdminAuthContext] Auth state changed:', _event, session ? 'authenticated' : 'not authenticated')
      setIsAuthenticated(Boolean(session))
      setIsAdmin(Boolean(session))
      setAdminName(session?.user?.email ?? null)
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: session.user.email ?? 'Admin' }))
      } else {
        localStorage.removeItem(SESSION_KEY)
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()
    if (!normalizedEmail || !normalizedPassword) return false

    if (!supabase) return false

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    })

    if (error) {
      console.error('[login] Error:', error.message)
      return false
    }

    if (!data.session) {
      console.error('[login] No session returned')
      return false
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: name || data.user.email || 'Admin' }))
    setIsAdmin(true)
    setIsAuthenticated(true)
    setAdminName(name || data.user.email || 'Admin')
    return true
  }

  const requestMagicLink = async (email: string, name?: string) => {
    const normalized = email.trim()
    if (!normalized || !normalized.includes('@')) return false

    if (supabase) {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}` : undefined
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      })

      if (error) {
        console.error('[requestMagicLink] Error:', error.message)
        return false
      }

      // Don't set authenticated state here - user needs to click the link first
      // The auth state change listener will handle actual authentication
      return true
    }

    return false
  }

  const signUpPublicUser = async (email: string, password: string, name?: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()
    if (!normalizedEmail || !normalizedPassword || !supabase) return false

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: normalizedPassword,
      options: {
        data: { full_name: name || normalizedEmail },
      },
    })

    if (error) {
      console.error('[signUpPublicUser] Error:', error.message)
      return false
    }

    // If no session, sign in the user immediately
    if (!data.session) {
      console.log('[signUpPublicUser] No session - signing in immediately')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      })

      if (signInError || !signInData.session) {
        console.error('[signUpPublicUser] Auto sign-in failed:', signInError?.message)
        return false
      }

      const publicName = name || signInData.user?.email || 'Public User'
      localStorage.setItem(SESSION_KEY, JSON.stringify({ name: publicName }))
      setIsAdmin(true)
      setIsAuthenticated(true)
      setAdminName(publicName)
      console.log('[signUpPublicUser] User signed up and auto-signed in:', publicName)
      return true
    }

    // Session exists - user is signed in
    const publicName = name || data.user?.email || 'Public User'
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: publicName }))
    setIsAdmin(true)
    setIsAuthenticated(true)
    setAdminName(publicName)
    console.log('[signUpPublicUser] User signed up successfully:', publicName)
    return true
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
    <AdminAuthContext.Provider value={{ isAdmin, isAuthenticated, adminName, login, requestMagicLink, signUpPublicUser, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
