import type { ReactNode } from 'react'

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
    <div className="relative overflow-hidden bg-navy-900">
      <div
        className="cross-emblem pointer-events-none absolute -right-10 top-0 h-64 w-64 bg-white/[0.05] sm:h-80 sm:w-80"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-8 sm:pb-10 sm:pt-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-100/60">
          Student Body Organization
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl text-[15px] text-navy-100/75">{subtitle}</p>}
        {badge && <div className="mt-4">{badge}</div>}
        {children}
      </div>
    </div>
  )
}
