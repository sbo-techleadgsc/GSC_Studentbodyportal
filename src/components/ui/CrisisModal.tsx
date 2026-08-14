import { Phone, AlertTriangle, X } from 'lucide-react'
import { Modal } from './Modal'
import { CRISIS_HOTLINES } from '@/lib/crisisDetection'

interface CrisisModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
}

export function CrisisModal({ isOpen, onClose, onContinue }: CrisisModalProps) {
  if (!isOpen) return null

  return (
    <Modal onClose={onClose} title="⚠️ Crisis Support Resources">
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900">You may need immediate support</h3>
              <p className="mt-2 text-sm text-amber-800">
                It sounds like you might be going through a difficult time. Anonymous web forms are for non-emergencies. 
                If you're in crisis, please reach out to someone who can help right now.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-ink-900 mb-3">Immediate Support Hotlines</h4>
          <div className="space-y-3">
            {CRISIS_HOTLINES.map((hotline) => (
              <a
                key={hotline.phone}
                href={`tel:${hotline.phone.replace(/[^0-9+]/g, '')}`}
                className="block rounded-lg border border-navy-200 bg-navy-50 p-4 hover:bg-navy-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy-900">{hotline.name}</p>
                    <p className="text-sm text-navy-700">{hotline.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-navy-900">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">{hotline.phone}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-surface-muted p-4">
          <p className="text-sm text-ink-700">
            <strong>Important:</strong> If this is an emergency or you're in immediate danger, 
            please call emergency services or go to the nearest emergency room.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-app border border-navy-900/10 px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-navy-50"
          >
            I want to call a hotline
          </button>
          <button
            onClick={onContinue}
            className="flex-1 rounded-app bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            Continue to form
          </button>
        </div>
      </div>
    </Modal>
  )
}
