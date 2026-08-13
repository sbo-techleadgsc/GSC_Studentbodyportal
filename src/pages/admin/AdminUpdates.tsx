import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui/Primitives'
import { Field, Input, Textarea, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { updatesDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import type { UpdateEntry, UpdateCategory } from '@/lib/types'

const CATEGORIES: UpdateCategory[] = ['General Assembly', 'Exec Board', 'Finance', 'Event', 'Policy']

const emptyForm = {
  title: '',
  category: 'General Assembly' as UpdateCategory,
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

export default function AdminUpdates() {
  const [updates] = useLiveData(updatesDb.list)
  const [editing, setEditing] = useState<UpdateEntry | typeof emptyForm | null>(null)

  async function handleDelete(id: string) {
    if (confirm('Delete this update?')) await updatesDb.remove(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Updates</h1>
        <Button onClick={() => setEditing(emptyForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Update
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {updates?.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink-900">{u.title}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-ink-400">
                <Badge tone="gold">{u.category}</Badge> {formatDate(u.date)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(u)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && <UpdateForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function UpdateForm({ initial, onClose }: { initial: UpdateEntry | typeof emptyForm; onClose: () => void }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.title || !form.description) return
    setSaving(true)
    try {
      await updatesDb.upsert(form)
      onClose()
    } catch (error) {
      console.error('Failed to save update:', error)
      alert('Failed to save update. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={'id' in form ? 'Edit Update' : 'Add Update'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="General Assembly - 2nd Semester Opening" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as UpdateCategory })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened, what was decided..." />
        </Field>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>{saving ? 'Publishing...' : 'Publish Update'}</Button>
        </div>
      </div>
    </Modal>
  )
}
