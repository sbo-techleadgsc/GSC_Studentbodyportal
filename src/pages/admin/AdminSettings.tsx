import { useState, useEffect } from 'react'
import { Wrench } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui/Primitives'
import { Field, Textarea } from '@/components/ui/Form'
import { useLiveData } from '@/lib/hooks'
import { settingsDb } from '@/lib/store'

export default function AdminSettings() {
  const [settings, reload] = useLiveData(settingsDb.get)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (settings) setMessage(settings.maintenanceMessage)
  }, [settings])

  async function toggle() {
    await settingsDb.update({ maintenanceMode: !settings?.maintenanceMode })
    reload()
  }

  async function saveMessage() {
    await settingsDb.update({ maintenanceMessage: message })
    reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Settings</h1>
      <p className="mt-1 text-ink-600">Site-wide controls.</p>

      <Card className="mt-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-900">
              <Wrench className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-bold text-ink-900">Maintenance Mode</p>
              <p className="mt-1 text-sm text-ink-600">
                Shows a maintenance page to every visitor on the public site.
                The admin panel stays reachable so you can turn it back off.
              </p>
            </div>
          </div>
          <Badge tone={settings?.maintenanceMode ? 'warning' : 'success'}>
            {settings?.maintenanceMode ? 'ON' : 'OFF'}
          </Badge>
        </div>

        <Button
          className="mt-4"
          variant={settings?.maintenanceMode ? 'danger' : 'primary'}
          onClick={toggle}
        >
          {settings?.maintenanceMode ? 'Turn Off Maintenance Mode' : 'Turn On Maintenance Mode'}
        </Button>

        <div className="mt-6 border-t border-navy-900/5 pt-5">
          <Field label="Message shown to visitors">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </Field>
          <Button variant="outline" size="sm" className="mt-3" onClick={saveMessage}>
            Save Message
          </Button>
        </div>
      </Card>
    </div>
  )
}