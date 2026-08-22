import type * as React from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

// Button
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950',
  secondary: 'bg-white text-navy-900 hover:bg-navy-50 active:bg-navy-100 shadow-sm border border-navy-900/10',
  outline: 'bg-white/90 border border-navy-900/15 text-navy-900 hover:bg-navy-50 active:bg-navy-100',
  ghost: 'bg-transparent text-navy-900 hover:bg-navy-50',
  danger: 'bg-danger-600 text-white hover:opacity-90',
  success: 'bg-success-600 text-white hover:opacity-90',
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-app font-semibold transition-all duration-200 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        size === 'md' ? 'px-5 py-2.5 text-sm' : 'px-3.5 py-1.5 text-xs',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

// Card
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx('glass-surface rounded-app transition-colors duration-200 hover:border-navy-900/20', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

// Badge (pill tag)
type BadgeTone = 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'neutral'
const badgeTones: Record<BadgeTone, string> = {
  navy: 'bg-navy-100 text-navy-900',
  gold: 'bg-gold-100 text-gold-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-600',
  neutral: 'bg-surface-muted text-ink-600',
}

export function Badge({ tone = 'navy', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', badgeTones[tone], className)}>
      {children}
    </span>
  )
}

// Status pill (for promises / reports)
export function StatusPill({ status }: { status: 'pending' | 'in-progress' | 'completed' | 'under-review' | 'resolved' | 'rejected' }) {
  const map: Record<string, { tone: BadgeTone; label: string }> = {
    pending: { tone: 'neutral', label: 'Pending' },
    'in-progress': { tone: 'navy', label: 'In Progress' },
    completed: { tone: 'success', label: 'Completed' },
    'under-review': { tone: 'navy', label: 'Under Review' },
    resolved: { tone: 'success', label: 'Resolved' },
    rejected: { tone: 'danger', label: 'Rejected' },
  }
  const { tone, label } = map[status]
  return <Badge tone={tone}>{label}</Badge>
}

// Section eyebrow + heading
export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-900/80">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-xl text-ink-600">{subtitle}</p>}
    </div>
  )
}

// Empty state
export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="glass-surface flex flex-col items-center justify-center gap-3 rounded-app border border-white/60 px-6 py-16 text-center">
      <div className="text-navy-900/30">{icon}</div>
      <p className="font-semibold text-ink-900">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-ink-400">{subtitle}</p>}
    </div>
  )
}
