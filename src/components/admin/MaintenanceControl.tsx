import { useState, useEffect } from 'react'
import { Wrench, ExternalLink } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui/Primitives'
import { Field, Textarea } from '@/components/ui/Form'
import { clsx } from '@/lib/clsx'
import { useLiveData } from '@/lib/hooks'
import { settingsDb } from '@/lib/store'

export function MaintenanceControl() {
  const [settings, reload] = useLiveData(settingsDb.get)
  const [message, setMessage] = useState('')
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (settings) setMessage(settings.maintenanceMessage)
  }, [settings])

  async function toggle() {
    setToggling(true)
    setError(null)
    try {
      await settingsDb.update({ maintenanceMode: !settings?.maintenanceMode })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update maintenance mode.')
    } finally {
      setToggling(false)
    }
  }

  async function saveMessage() {
    setError(null)
    try {
      await settingsDb.update({ maintenanceMessage: message })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save message.')
    }
  }

  const previewUrl = settings?.maintenanceMessage
    ? `/under-maintenance.html?message=${encodeURIComponent(settings.maintenanceMessage)}`
    : '/under-maintenance.html'

  return (
    <Card className={`p-6 ${settings?.maintenanceMode ? 'border border-gold-400/40 bg-gold-50/50 !shadow-none' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-900">
            <Wrench className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-bold text-ink-900">Maintenance Mode</p>
            <p className="mt-1 text-sm text-ink-600">
              When on, every public visitor on any device is sent to{' '}
              <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">/under-maintenance.html</code>.
              Admin pages stay available so you can turn it off.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={settings?.maintenanceMode ? 'warning' : 'success'}>
            {settings?.maintenanceMode ? 'ON' : 'OFF'}
          </Badge>
          <button
            type="button"
            role="switch"
            aria-checked={settings?.maintenanceMode ?? false}
            aria-label="Toggle maintenance mode"
            disabled={toggling}
            onClick={toggle}
            className={clsx(
              'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50',
              settings?.maintenanceMode ? 'bg-gold-500' : 'bg-ink-300'
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                settings?.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-app bg-danger-100/60 px-3 py-2 text-sm text-danger-600">{error}</p>
      )}

      <div className="mt-4">
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline"
        >
          Preview under-maintenance.html <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-6 border-t border-navy-900/5 pt-5">
        <Field label="Message shown on under-maintenance.html">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        </Field>
        <Button variant="outline" size="sm" className="mt-3" onClick={saveMessage}>
          Save Message
        </Button>
      </div>
    </Card>
  )
}
