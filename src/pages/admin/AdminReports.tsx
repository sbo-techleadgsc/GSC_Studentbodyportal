import { useState } from 'react'
import { Eye, Lock, Trash2 } from 'lucide-react'
import { Card, Button, StatusPill, Badge } from '@/components/ui/Primitives'
import { Select, Textarea, Field } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { reportsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { clsx } from '@/lib/clsx'
import type { Report, ReportStatus } from '@/lib/types'

const FILTERS: { key: 'all' | ReportStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'in-review', label: 'In Review' },
  { key: 'resolved', label: 'Resolved' },
]

export default function AdminReports() {
  const [reports] = useLiveData(reportsDb.list)
  const [filter, setFilter] = useState<'all' | ReportStatus>('all')
  const [active, setActive] = useState<Report | null>(null)

  const filtered = reports?.filter((r) => filter === 'all' || r.status === filter)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Reports</h1>
          <p className="mt-1 text-sm text-ink-600">
            Total: {reports?.length ?? 0} &middot; New: {reports?.filter((r) => r.status === 'new').length ?? 0}
          </p>
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              filter === key ? 'bg-navy-900 text-white' : 'bg-white text-ink-600 hover:bg-navy-50'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered?.map((r) => (
          <Card key={r.id} className="cursor-pointer p-4" onClick={() => setActive(r)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-ink-900">{r.trackingCode}</span>
                <Badge tone="neutral">
                  {r.visibility === 'anonymous' ? (
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Anonymous</span>
                  ) : (
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {r.fullName}</span>
                  )}
                </Badge>
              </div>
              <StatusPill status={r.status} />
            </div>
            <p className="mt-2 text-sm text-ink-600">{r.category}: {r.content}</p>
            <p className="mt-1 text-xs text-ink-400">{formatDate(r.createdAt)}</p>
          </Card>
        ))}
      </div>

      {active && <ReportDetail report={active} onClose={() => setActive(null)} />}
    </div>
  )
}

function ReportDetail({ report, onClose }: { report: Report; onClose: () => void }) {
  const [status, setStatus] = useState(report.status)
  const [notes, setNotes] = useState(report.adminNotes ?? '')

  async function save() {
    await reportsDb.updateStatus(report.id, status, notes)
    onClose()
  }

  async function remove() {
    if (confirm('Delete this report permanently?')) {
      await reportsDb.remove(report.id)
      onClose()
    }
  }

  return (
    <Modal title={report.trackingCode} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {report.visibility === 'anonymous' ? 'Anonymous Report' : `From ${report.fullName} (${report.email})`}
          </p>
          <p className="mt-1 text-sm text-ink-600">{report.category} &middot; Submitted {formatDate(report.createdAt)}</p>
        </div>
        <div className="rounded-app bg-surface-muted p-4 text-sm text-ink-900">{report.content}</div>

        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
            <option value="new">New</option>
            <option value="in-review">In Review</option>
            <option value="resolved">Resolved</option>
          </Select>
        </Field>

        <Field label="Admin Notes (optional)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note for the next tech lead..." />
        </Field>

        <div className="flex gap-2 pt-2">
          <Button variant="danger" className="gap-1.5" onClick={remove}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Update Status</Button>
        </div>
      </div>
    </Modal>
  )
}
