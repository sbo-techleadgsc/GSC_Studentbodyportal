import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { AdminLayout } from './AdminLayout'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdminAuth()
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return <AdminLayout>{children}</AdminLayout>
}
