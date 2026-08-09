import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

export default async function middleware(request) {
  const url = new URL(request.url)
  const { pathname } = url

  if (
    pathname === '/under-maintenance.html' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/') ||
    /\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot|map|html|webp)$/i.test(pathname)
  ) {
    return
  }

  if (!supabaseUrl || !supabaseAnonKey) return

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data } = await supabase
      .from('site_settings')
      .select('maintenance_mode, maintenance_message')
      .limit(1)
      .maybeSingle()

    if (data?.maintenance_mode) {
      const maintenanceUrl = new URL('/under-maintenance.html', url.origin)
      if (data.maintenance_message) {
        maintenanceUrl.searchParams.set('message', encodeURIComponent(data.maintenance_message))
      }
      return Response.redirect(maintenanceUrl.toString(), 302)
    }
  } catch (err) {
    console.error('Maintenance middleware error:', err)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
