import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, Button, StatusPill } from '@/components/ui/Primitives'
import { Field, Input, Textarea, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { promisesDb, officersDb } from '@/lib/store'
import type { Promise_, PromiseStatus } from '@/lib/types'

const emptyForm = {
  title: '',
  description: '',
  officerId: '',
  officerName: '',
  status: 'pending' as PromiseStatus,
  progress: 0,
  impactNote: '',
}

export default function AdminPromises() {
  const [promises] = useLiveData(promisesDb.list)
  const [officers] = useLiveData(officersDb.list)
  const [editing, setEditing] = useState<Promise_ | typeof emptyForm | null>(null)

  async function handleDelete(id: string) {
    if (confirm('Delete this promise?')) await promisesDb.remove(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Promises</h1>
        <Button onClick={() => setEditing(emptyForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add New Promise
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {promises?.map((p) => (
          <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink-900">{p.title}</p>
              <p className="text-xs text-ink-400">{p.officerName}</p>
            </div>
            <StatusPill status={p.status} />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(p)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && <PromiseForm initial={editing} officers={officers ?? []} onClose={() => setEditing(null)} />}
    </div>
  )
}

function PromiseForm({
  initial,
  officers,
  onClose,
}: {
  initial: Promise_ | typeof emptyForm
  officers: { id: string; name: string }[]
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.title || !form.description) return
    setSaving(true)
    try {
      const officer = officers.find((o) => o.id === form.officerId)
      const itemToSave: Promise_ = 'id' in form
        ? { ...form, officerName: officer?.name ?? form.officerName, updatedAt: new Date().toISOString() }
        : { ...form, id: crypto.randomUUID(), officerName: officer?.name ?? form.officerName, updatedAt: new Date().toISOString() }
      await promisesDb.upsert(itemToSave)
      onClose()
    } catch (error) {
      console.error('Failed to save promise:', error)
      alert('Failed to save promise. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={'id' in form ? 'Edit Promise' : 'Add Promise'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Free Printing Services" />
        </Field>
        <Field label="Officer">
          <Select value={form.officerId} onChange={(e) => setForm({ ...form, officerId: e.target.value })}>
            <option value="">Select officer</option>
            {officers.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was promised..." />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PromiseStatus })}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
        </Field>
        {form.status === 'in-progress' && (
          <Field label={`Progress (${form.progress}%)`}>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="w-full accent-navy-900"
            />
          </Field>
        )}
        {form.status === 'completed' && (
          <Field label="Impact Note (optional)" hint="e.g. 'Used by 847 students so far.'">
            <Input value={form.impactNote} onChange={(e) => setForm({ ...form, impactNote: e.target.value })} placeholder="What happened once delivered..." />
          </Field>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Promise'}</Button>
        </div>
      </div>
    </Modal>
  )
}
