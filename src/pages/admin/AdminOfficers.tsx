import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, Button } from '@/components/ui/Primitives'
import { Field, Input, Textarea } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { officersDb } from '@/lib/store'
import type { Officer } from '@/lib/types'

const emptyForm = { name: '', position: '', order: 1, year: '', major: '', email: '', photoUrl: '', bio: '' }

export default function AdminOfficers() {
  const [officers] = useLiveData(officersDb.list)
  const [editing, setEditing] = useState<Officer | typeof emptyForm | null>(null)

  async function handleDelete(id: string) {
    if (confirm('Remove this officer?')) await officersDb.remove(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Officers</h1>
        <Button onClick={() => setEditing(emptyForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add New Officer
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {officers?.map((o) => (
          <Card key={o.id} className="p-5">
            <div className="flex items-center gap-3">
              <img src={o.photoUrl} alt={o.name} className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate font-bold text-ink-900">{o.name}</p>
                <p className="truncate text-xs text-ink-400">{o.position}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setEditing(o)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="danger" className="gap-1" onClick={() => handleDelete(o.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && <OfficerForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function OfficerForm({ initial, onClose }: { initial: Officer | typeof emptyForm; onClose: () => void }) {
  const [form, setForm] = useState(initial)

  async function save() {
    if (!form.name || !form.position) return
    await officersDb.upsert({ ...form, photoUrl: form.photoUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(form.name)}` })
    onClose()
  }

  return (
    <Modal title={'id' in form ? 'Edit Officer' : 'Add Officer'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Full Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maria Santos" />
        </Field>
        <Field label="Position">
          <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Student Body President" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Year">
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="4th Year" />
          </Field>
          <Field label="Major">
            <Input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="BS Nursing" />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@gsc.edu.ph" />
        </Field>
        <Field label="Photo URL" hint="Paste a link to their photo. (File uploads connect via Supabase Storage - see README.)">
          <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
        </Field>
        <Field label="Short Bio (optional)">
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A sentence or two about them..." />
        </Field>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Save Officer</Button>
        </div>
      </div>
    </Modal>
  )
}
