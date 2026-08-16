import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui/Primitives'
import { Field, Input, Textarea, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useLiveData } from '@/lib/hooks'
import { eventsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import type { EventCategory, ScheduledEvent } from '@/lib/types'

const emptyForm = {
  title: '',
  category: 'School' as EventCategory,
  description: '',
  location: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  startTime: '',
  endTime: '',
  imageUrl: '',
}

const CATEGORY_TONE: Record<EventCategory, 'navy' | 'gold' | 'success' | 'neutral'> = {
  School: 'navy',
  Organization: 'gold',
  Assembly: 'success',
  Other: 'neutral',
}

export default function AdminEvents() {
  const [events] = useLiveData(eventsDb.list)
  const [editing, setEditing] = useState<ScheduledEvent | typeof emptyForm | null>(null)

  async function handleDelete(id: string) {
    if (confirm('Delete this event?')) await eventsDb.remove(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Events</h1>
        <Button onClick={() => setEditing(emptyForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {events?.length === 0 && (
          <Card className="p-6 text-center text-sm text-ink-400">No events yet. Add your first event to populate the public calendar.</Card>
        )}

        {events?.map((event) => (
          <Card key={event.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink-900">{event.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                <Badge tone={CATEGORY_TONE[event.category]}>{event.category}</Badge>
                <span>{formatDate(event.startDate)}</span>
                {event.location && <span>· {event.location}</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(event)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(event.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && <EventForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function EventForm({ initial, onClose }: { initial: ScheduledEvent | typeof emptyForm; onClose: () => void }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.title || !form.startDate) return
    setSaving(true)
    try {
      const itemToSave: ScheduledEvent =
        'id' in form ? form : { ...form, id: crypto.randomUUID(), endDate: form.endDate || undefined }
      await eventsDb.upsert(itemToSave)
      onClose()
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={'id' in form ? 'Edit Event' : 'Add Event'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Founding Anniversary Celebration" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}>
              <option value="School">School</option>
              <option value="Organization">Organization</option>
              <option value="Assembly">Assembly</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
          <Field label="Location">
            <Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="GSC Gymnasium" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="End Date (optional)" hint="Leave blank for a single-day event">
            <Input type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Time (optional)">
            <Input type="time" value={form.startTime || ''} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </Field>
          <Field label="End Time (optional)">
            <Input type="time" value={form.endTime || ''} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's happening at this event?" />
        </Field>
        <ImageUpload
          value={form.imageUrl || ''}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
          label="Image (optional)"
          folder="events"
        />
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Event'}</Button>
        </div>
      </div>
    </Modal>
  )
}
