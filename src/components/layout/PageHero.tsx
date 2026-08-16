import type { ReactNode } from 'react'
import { siteConfig } from '@/config/site'

export function PageHero({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string
  subtitle?: string
  badge?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="border-b border-navy-900/5 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-900/60">
          {siteConfig.schoolName} &middot; {siteConfig.orgName}
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl font-thin text-[15px] text-ink-600">{subtitle}</p>}
        {badge && <div className="mt-4">{badge}</div>}
        {children}
      </div>
    </div>
  )
}
