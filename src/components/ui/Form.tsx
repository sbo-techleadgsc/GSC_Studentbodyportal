import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { clsx } from '@/lib/clsx'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  )
}

const fieldBase =
  'w-full rounded-app border border-navy-900/10 bg-surface px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-navy-900/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-colors'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldBase, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(fieldBase, 'min-h-28 resize-y', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(fieldBase, 'cursor-pointer appearance-none bg-[right_1rem_center] bg-no-repeat pr-10', className)} {...props}>
      {children}
    </select>
  )
}
