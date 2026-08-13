import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui/Primitives'
import { Field, Input } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { pollsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'

const emptyForm = {
  question: '',
  type: 'single' as const,
  options: [{ label: '' }, { label: '' }],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
  isOpen: true,
}

export default function AdminPolls() {
  const [polls] = useLiveData(pollsDb.list)
  const [creating, setCreating] = useState(false)

  async function handleDelete(id: string) {
    if (confirm('Delete this poll?')) await pollsDb.remove(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Polls</h1>
        <Button onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create New Poll
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {polls?.map((p) => {
          const total = p.options.reduce((s, o) => s + o.votes, 0)
          return (
            <Card key={p.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink-900">{p.question}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {total} votes &middot; {p.isOpen ? `Ends ${formatDate(p.endDate)}` : `Closed ${formatDate(p.endDate)}`}
                  </p>
                </div>
                <Badge tone={p.isOpen ? 'success' : 'neutral'}>{p.isOpen ? 'Open' : 'Closed'}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => pollsDb.toggleOpen(p.id, !p.isOpen)}>
                  {p.isOpen ? 'Close Poll' : 'Reopen Poll'}
                </Button>
                <Button size="sm" variant="danger" className="gap-1" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {creating && <PollForm onClose={() => setCreating(false)} />}
    </div>
  )
}

function PollForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  function updateOption(i: number, label: string) {
    const options = [...form.options]
    options[i] = { label }
    setForm({ ...form, options })
  }
  function addOption() {
    setForm({ ...form, options: [...form.options, { label: '' }] })
  }
  function removeOption(i: number) {
    setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) })
  }

  async function save() {
    const validOptions = form.options.filter((o) => o.label.trim())
    if (!form.question || validOptions.length < 2) return
    setSaving(true)
    try {
      await pollsDb.upsert({ ...form, options: validOptions })
      onClose()
    } catch (error) {
      console.error('Failed to save poll:', error)
      alert('Failed to save poll. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Create Poll" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Question">
          <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What should the Prom 2026 theme be?" />
        </Field>

        <Field label="Options">
          <div className="space-y-2">
            {form.options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <Input value={o.label} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                {form.options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="rounded-app p-2 text-ink-400 hover:bg-danger-100 hover:text-danger-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addOption} className="mt-2 text-sm font-semibold text-navy-900 hover:underline">
            + Add option
          </button>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="End Date">
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Field>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>{saving ? 'Creating...' : 'Create & Publish'}</Button>
        </div>
      </div>
    </Modal>
  )
}
