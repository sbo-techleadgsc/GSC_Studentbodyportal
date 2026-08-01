import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const normalizedSupabaseUrl = rawSupabaseUrl?.trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '')

export const supabase = normalizedSupabaseUrl && supabaseAnonKey && !normalizedSupabaseUrl.includes('paste_your_supabase_project_url_here')
  ? createClient(normalizedSupabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export const isSupabaseConfigured = Boolean(supabase)

if (typeof window !== 'undefined') {
  console.info(`[supabase] ${isSupabaseConfigured ? 'configured' : 'not configured'} (${import.meta.env.VITE_SUPABASE_URL ? 'env present' : 'env missing'})`)
}
