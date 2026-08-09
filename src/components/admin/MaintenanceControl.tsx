import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, ExternalLink } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui/Primitives'
import { Field, Textarea } from '@/components/ui/Form'
import { useLiveData } from '@/lib/hooks'
import { settingsDb } from '@/lib/store'

interface MaintenanceControlProps {
  variant?: 'compact' | 'full'
}

export function MaintenanceControl({ variant = 'full' }: MaintenanceControlProps) {
  const [settings, reload] = useLiveData(settingsDb.get)
  const [message, setMessage] = useState('')
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (settings) setMessage(settings.maintenanceMessage)
  }, [settings])

  async function toggle() {
    setToggling(true)
    try {
      await settingsDb.update({ maintenanceMode: !settings?.maintenanceMode })
      reload()
    } finally {
      setToggling(false)
    }
  }

  async function saveMessage() {
    await settingsDb.update({ maintenanceMessage: message })
    reload()
  }

  const previewUrl = settings?.maintenanceMessage
    ? `/under-maintenance.html?message=${encodeURIComponent(settings.maintenanceMessage)}`
    : '/under-maintenance.html'

  if (variant === 'compact') {
    return (
      <Card
        className={`p-5 ${
          settings?.maintenanceMode
            ? 'border border-gold-400/40 bg-gold-50 !shadow-none'
            : ''
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-900">
              <Wrench className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-bold text-ink-900">Maintenance Mode</p>
              <p className="mt-0.5 text-sm text-ink-600">
                {settings?.maintenanceMode
                  ? 'Visitors are seeing under-maintenance.html right now.'
                  : 'Turn on to show under-maintenance.html to all public visitors.'}
              </p>
            </div>
          </div>
          <Badge tone={settings?.maintenanceMode ? 'warning' : 'success'}>
            {settings?.maintenanceMode ? 'ON' : 'OFF'}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant={settings?.maintenanceMode ? 'danger' : 'primary'}
            size="sm"
            onClick={toggle}
            disabled={toggling}
          >
            {settings?.maintenanceMode ? 'Turn Off' : 'Turn On'}
          </Button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline"
          >
            Preview page <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            to="/admin/settings"
            className="text-sm font-semibold text-ink-400 hover:text-ink-600"
          >
            Edit message
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-900">
            <Wrench className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-bold text-ink-900">Maintenance Mode</p>
            <p className="mt-1 text-sm text-ink-600">
              Redirects every public visitor to{' '}
              <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">/under-maintenance.html</code>.
              The admin panel stays reachable so you can turn it back off.
            </p>
          </div>
        </div>
        <Badge tone={settings?.maintenanceMode ? 'warning' : 'success'}>
          {settings?.maintenanceMode ? 'ON' : 'OFF'}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant={settings?.maintenanceMode ? 'danger' : 'primary'}
          onClick={toggle}
          disabled={toggling}
        >
          {settings?.maintenanceMode ? 'Turn Off Maintenance Mode' : 'Turn On Maintenance Mode'}
        </Button>
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
