import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { useEffect } from 'react'

import Home from '@/pages/Home'
import Officials from '@/pages/Officials'
import Promises from '@/pages/Promises'
import Budget from '@/pages/Budget'
import Updates from '@/pages/Updates'
import Reports from '@/pages/Reports'
import News from '@/pages/News'
import Voting from '@/pages/Voting'
import Account from '@/pages/Account'

import AdminLogin from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminOfficers from '@/pages/admin/AdminOfficers'
import AdminPromises from '@/pages/admin/AdminPromises'
import AdminBudget from '@/pages/admin/AdminBudget'
import AdminUpdates from '@/pages/admin/AdminUpdates'
import AdminReports from '@/pages/admin/AdminReports'
import AdminNews from '@/pages/admin/AdminNews'
import AdminPolls from '@/pages/admin/AdminPolls'
import NotFound from '@/pages/NotFound'

function SecretShortcut() {
  const navigate = useNavigate()

  useEffect(() => {
    const secretCode = ['s', 'b', 'o', 'a', 'd', 'm', 'i', 'n']
    let currentIndex = 0

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === secretCode[currentIndex]) {
        currentIndex++
        if (currentIndex === secretCode.length) {
          navigate('/admin/login')
          currentIndex = 0
        }
      } else {
        currentIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [navigate])

  return null
}

function AppContent() {
  return (
    <>
      <SecretShortcut />
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/officials" element={<PublicLayout><Officials /></PublicLayout>} />
        <Route path="/promises" element={<PublicLayout><Promises /></PublicLayout>} />
        <Route path="/budget" element={<PublicLayout><Budget /></PublicLayout>} />
        <Route path="/updates" element={<PublicLayout><Updates /></PublicLayout>} />
        <Route path="/reports" element={<PublicLayout><Reports /></PublicLayout>} />
        <Route path="/news" element={<PublicLayout><News /></PublicLayout>} />
        <Route path="/voting" element={<PublicLayout><Voting /></PublicLayout>} />
        <Route path="/account" element={<PublicLayout><Account /></PublicLayout>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/officers" element={<AdminGuard><AdminOfficers /></AdminGuard>} />
        <Route path="/admin/promises" element={<AdminGuard><AdminPromises /></AdminGuard>} />
        <Route path="/admin/budget" element={<AdminGuard><AdminBudget /></AdminGuard>} />
        <Route path="/admin/updates" element={<AdminGuard><AdminUpdates /></AdminGuard>} />
        <Route path="/admin/reports" element={<AdminGuard><AdminReports /></AdminGuard>} />
        <Route path="/admin/news" element={<AdminGuard><AdminNews /></AdminGuard>} />
        <Route path="/admin/polls" element={<AdminGuard><AdminPolls /></AdminGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
