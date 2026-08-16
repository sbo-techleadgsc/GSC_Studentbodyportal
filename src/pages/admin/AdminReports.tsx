import { useState } from 'react'
import { Eye, Lock, Trash2, Check, Ban, Shield } from 'lucide-react'
import { Card, Button, StatusPill, Badge } from '@/components/ui/Primitives'
import { Select, Textarea, Field } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useLiveData } from '@/lib/hooks'
import { reportsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { clsx } from '@/lib/clsx'
import type { Report, ReportStatus } from '@/lib/types'

const FILTERS: { key: 'all' | 'pending' | 'approved' | ReportStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'rejected', label: 'Rejected' },
]

export default function AdminReports() {
  const [reports] = useLiveData(reportsDb.list)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | ReportStatus>('all')
  const [active, setActive] = useState<Report | null>(null)

  const filtered = reports?.filter((r) => {
    if (filter === 'all') return !r.isShadowbanned
    if (filter === 'pending') return !r.isApproved && !r.isShadowbanned
    if (filter === 'approved') return r.isApproved && !r.isShadowbanned
    return r.status === filter && !r.isShadowbanned
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage Reports</h1>
          <p className="mt-1 text-sm text-ink-600">
            Total: {reports?.length ?? 0} &middot; Pending: {reports?.filter((r) => !r.isApproved && !r.isShadowbanned).length ?? 0}
          </p>
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95',
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
                {!r.isApproved && (
                  <Badge tone="warning">Pending Approval</Badge>
                )}
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
  const [adminReply, setAdminReply] = useState(report.adminReply ?? '')

  async function save() {
    await reportsDb.updateStatus(report.id, status, notes)
    onClose()
  }

  async function approve() {
    if (confirm('Approve this report? It will be visible to the student for tracking.')) {
      await reportsDb.approve(report.id, adminReply || undefined)
      onClose()
    }
  }

  async function shadowban() {
    if (confirm('Shadowban this report? This will silently hide it from the user while letting them think it was submitted.')) {
      await reportsDb.shadowban(report.id)
      onClose()
    }
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
          <p className="mt-1 text-sm text-ink-600">
            {report.category} &middot; Submitted {formatDate(report.createdAt)}
            {report.studentId && <span className="ml-2">ID: {report.studentId}</span>}
            {report.section && <span className="ml-2">Section: {report.section}</span>}
          </p>
          {report.contactMethod && report.contactValue && (
            <p className="mt-1 text-xs text-ink-500">
              Contact: {report.contactMethod} - {report.contactValue}
            </p>
          )}
        </div>
        <div className="rounded-app bg-surface-muted p-4 text-sm text-ink-900">{report.content}</div>

        {!report.isApproved && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">Approval Required</p>
            <p className="text-xs text-amber-800">This report is pending admin approval before the student can track it.</p>
          </div>
        )}

        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
            <option value="pending">Pending</option>
            <option value="under-review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </Field>

        <Field label="Admin Notes (internal)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note for other admins..." />
        </Field>

        <Field label="Admin Reply (visible to student)">
          <Textarea value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Response that will be visible to the student..." />
        </Field>

        <div className="flex gap-2 pt-2">
          <Button variant="danger" className="gap-1.5" onClick={remove}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={shadowban}>
            <Shield className="h-3.5 w-3.5" /> Shadowban
          </Button>
          {!report.isApproved && (
            <Button variant="success" className="gap-1.5" onClick={approve}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Update</Button>
        </div>
      </div>
    </Modal>
  )
}
