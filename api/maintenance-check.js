// Vercel Edge Function to check maintenance mode
// This runs on every request before it reaches the React app
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export default async function handler(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Allow access to:
  // 1. The maintenance page itself
  // 2. Admin routes (so you can turn off maintenance mode)
  // 3. Static assets (images, css, js)
  // 4. API routes
  const allowedPaths = [
    '/under-maintenance.html',
    '/admin',
    '/api/',
    '/gsc_logo.svg',
    '/favicon',
  ]

  const isAllowedPath = allowedPaths.some(path => 
    pathname === path || 
    pathname.startsWith(path) ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/)
  )

  if (isAllowedPath) {
    // Continue to the requested resource
    return new Response(null, {
      status: 200,
      headers: {
        'x-maintenance-bypass': 'true'
      }
    })
  }

  // Check maintenance status from Supabase
  let maintenanceMode = false
  let maintenanceMessage = ''

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('maintenance_mode, maintenance_message')
        .eq('id', 'site_config')
        .single()

      if (!error && data) {
        maintenanceMode = data.maintenance_mode
        maintenanceMessage = data.maintenance_message || ''
      }
    } catch (err) {
      console.error('Error checking maintenance status:', err)
      // If Supabase fails, assume maintenance is off to avoid blocking all traffic
      maintenanceMode = false
    }
  }

  if (maintenanceMode) {
    // Redirect to maintenance page with message as query param
    const maintenanceUrl = new URL('/under-maintenance.html', url.origin)
    if (maintenanceMessage) {
      maintenanceUrl.searchParams.set('message', encodeURIComponent(maintenanceMessage))
    }
    
    return Response.redirect(maintenanceUrl, 302)
  }

  // Not in maintenance mode, continue normally
  return new Response(null, {
    status: 200,
    headers: {
      'x-maintenance-status': 'off'
    }
  })
}

export const config = {
  runtime: 'edge',
}
