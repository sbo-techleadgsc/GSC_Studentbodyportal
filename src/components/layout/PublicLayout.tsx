import { useEffect, type ReactNode } from 'react'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { useLiveData } from '@/lib/hooks'
import { settingsDb } from '@/lib/store'

export function PublicLayout({ children }: { children: ReactNode }) {
  const [settings] = useLiveData(settingsDb.get)

  useEffect(() => {
    if (!settings?.maintenanceMode) return
    const url = new URL('/under-maintenance.html', window.location.origin)
    if (settings.maintenanceMessage) {
      url.searchParams.set('message', encodeURIComponent(settings.maintenanceMessage))
    }
    window.location.replace(url.toString())
  }, [settings?.maintenanceMode, settings?.maintenanceMessage])

  if (settings?.maintenanceMode) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface safe-bottom">
      <TopNav />
      <main className="pb-20 md:pb-16">{children}</main>
      <BottomNav />
    </div>
  )
}