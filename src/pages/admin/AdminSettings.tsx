import { MaintenanceControl } from '@/components/admin/MaintenanceControl'

export default function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Settings</h1>
      <p className="mt-1 font-thin text-ink-600">Site-wide controls.</p>

      <div className="mt-6">
        <MaintenanceControl />
      </div>
    </div>
  )
}
