import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-navy-950/50 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full animate-modal-in overflow-y-auto rounded-t-app bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-app">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-400 hover:bg-surface-muted hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
