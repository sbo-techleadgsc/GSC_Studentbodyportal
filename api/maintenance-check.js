// Vercel Edge Function to check maintenance mode
// This runs on every request before it reaches the React app
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mbpddyszpdpsfjlokvrt.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icGRkeXN6cGRwc2ZqbG9rdnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTEzNTMsImV4cCI6MjEwMTA4NzM1M30.v3qZg2ztEpVkFDjKCew6Z1QAxfb60W6DzkL29ghtngw'

// Create Supabase client
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export default async function handler(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  console.log('Maintenance check for:', pathname)

  // Allow access to:
  // 1. The maintenance page itself
  // 2. Admin routes (so you can turn off maintenance mode)
  // 3. Static assets (images, css, js)
  // 4. API routes
  const allowedPaths = [
    '/under-maintenance.html',
    '/admin',
    '/api/',
    '/favicon',
  ]

  const isAllowedPath = allowedPaths.some(path => 
    pathname === path || 
    pathname.startsWith(path) ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/)
  )

  if (isAllowedPath) {
    console.log('Path allowed, bypassing maintenance check')
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

  console.log('Supabase config:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey })

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('maintenance_mode, maintenance_message')
        .single()

      console.log('Supabase response:', { error, data })

      if (!error && data) {
        maintenanceMode = data.maintenance_mode
        maintenanceMessage = data.maintenance_message || ''
        console.log('Maintenance mode:', maintenanceMode)
      }
    } catch (err) {
      console.error('Error checking maintenance status:', err)
      // If Supabase fails, assume maintenance is off to avoid blocking all traffic
      maintenanceMode = false
    }
  }

  if (maintenanceMode) {
    console.log('Redirecting to maintenance page')
    // Redirect to maintenance page with message as query param
    const maintenanceUrl = new URL('/under-maintenance.html', url.origin)
    if (maintenanceMessage) {
      maintenanceUrl.searchParams.set('message', encodeURIComponent(maintenanceMessage))
    }
    
    return Response.redirect(maintenanceUrl, 302)
  }

  console.log('Maintenance mode off, continuing normally')
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
