import type { ReactNode } from 'react'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { MaintenanceScreen } from '@/components/MaintenanceScreen'
import { useLiveData } from '@/lib/hooks'
import { settingsDb } from '@/lib/store'
import { useEffect } from 'react'

export function PublicLayout({ children }: { children: ReactNode }) {
  const [settings] = useLiveData(settingsDb.get)

  // If maintenance mode is on, redirect to the HTML maintenance page
  useEffect(() => {
    if (settings?.maintenanceMode && typeof window !== 'undefined') {
      const maintenanceUrl = new URL('/under-maintenance.html', window.location.origin)
      if (settings.maintenanceMessage) {
        maintenanceUrl.searchParams.set('message', encodeURIComponent(settings.maintenanceMessage))
      }
      window.location.href = maintenanceUrl.toString()
    }
  }, [settings])

  // Show maintenance screen while redirecting
  if (settings?.maintenanceMode) {
    return <MaintenanceScreen message={settings.maintenanceMessage} />
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <main className="pb-20 md:pb-16">{children}</main>
      <BottomNav />
    </div>
  )
}