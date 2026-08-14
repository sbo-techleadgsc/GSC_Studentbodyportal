import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, Button } from '@/components/ui/Primitives'
import { Field, Input, Textarea } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { budgetDb } from '@/lib/store'
import { peso } from '@/lib/format'
import type { BudgetItem } from '@/lib/types'

const emptyForm = { category: '', allocated: 0, spent: 0, description: '' }

export default function AdminBudget() {
  const [budget] = useLiveData(budgetDb.list)
  const [editing, setEditing] = useState<BudgetItem | typeof emptyForm | null>(null)
  const total = budget?.reduce((s, b) => s + b.allocated, 0) ?? 0

  async function handleDelete(id: string) {
    if (confirm('Delete this budget item?')) await budgetDb.remove(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Budget</h1>
          <p className="mt-1 text-sm text-ink-600">Total Budget: {peso(total)}</p>
        </div>
        <Button onClick={() => setEditing(emptyForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Budget Item
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {budget?.map((b) => (
          <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink-900">{b.category}</p>
              <p className="text-xs text-ink-400">
                Allocated: {peso(b.allocated)} &middot; Spent: {peso(b.spent)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(b)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && <BudgetForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function BudgetForm({ initial, onClose }: { initial: BudgetItem | typeof emptyForm; onClose: () => void }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.category) return
    setSaving(true)
    try {
      const itemToSave = 'id' in form ? form : { ...form, id: crypto.randomUUID() }
      await budgetDb.upsert(itemToSave)
      onClose()
    } catch (error) {
      console.error('Failed to save budget item:', error)
      alert('Failed to save budget item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={'id' in form ? 'Edit Budget Item' : 'Add Budget Item'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Category">
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Events & Activities" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount Allocated (₱)">
            <Input type="number" value={form.allocated} onChange={(e) => setForm({ ...form, allocated: Number(e.target.value) })} />
          </Field>
          <Field label="Amount Spent (₱)">
            <Input type="number" value={form.spent} onChange={(e) => setForm({ ...form, spent: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Description (optional)">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this fund covers..." />
        </Field>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  )
}
