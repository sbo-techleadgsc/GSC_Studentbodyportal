import type { ReactNode } from 'react'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <main className="pb-20 md:pb-16 animate-fade-in">{children}</main>
      <BottomNav />
    </div>
  )
}
