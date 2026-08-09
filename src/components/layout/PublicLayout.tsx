import type { ReactNode } from 'react'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { MaintenanceScreen } from '@/components/MaintenanceScreen'
import { useLiveData } from '@/lib/hooks'
import { settingsDb } from '@/lib/store'

export function PublicLayout({ children }: { children: ReactNode }) {
  const [settings] = useLiveData(settingsDb.get)

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