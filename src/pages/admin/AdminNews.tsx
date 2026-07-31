import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui/Primitives'
import { Field, Input, Textarea, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { newsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import type { NewsPost, NewsCategory } from '@/lib/types'

const emptyForm = {
  title: '',
  category: 'Announcement' as NewsCategory,
  content: '',
  imageUrl: '',
  date: new Date().toISOString().slice(0, 10),
}

export default function AdminNews() {
  const [news] = useLiveData(newsDb.list)
  const [editing, setEditing] = useState<NewsPost | typeof emptyForm | null>(null)

  async function handleDelete(id: string) {
    if (confirm('Delete this news post?')) await newsDb.remove(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage News</h1>
        <Button onClick={() => setEditing(emptyForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Post New News
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {news?.map((n) => (
          <Card key={n.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink-900">{n.title}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-ink-400">
                <Badge tone="navy">{n.category}</Badge> {formatDate(n.date)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(n)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(n.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && <NewsForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function NewsForm({ initial, onClose }: { initial: NewsPost | typeof emptyForm; onClose: () => void }) {
  const [form, setForm] = useState(initial)

  async function save() {
    if (!form.title || !form.content) return
    await newsDb.upsert(form)
    onClose()
  }

  return (
    <Modal title={'id' in form ? 'Edit News' : 'Post News'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="GSC Launches New Online Grievance Portal" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as NewsCategory })}>
              <option value="Announcement">Announcement</option>
              <option value="Events">Events</option>
              <option value="Update">Update</option>
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </div>
        <Field label="Content">
          <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write the announcement..." />
        </Field>
        <Field label="Image URL (optional)" hint="Paste a link, or connect Supabase Storage for drag-and-drop uploads later.">
          <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
        </Field>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Publish News</Button>
        </div>
      </div>
    </Modal>
  )
}
