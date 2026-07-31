import { createClient } from '@supabase/supabase-js'

// Pull keys from environment variables
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single, reusable Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
