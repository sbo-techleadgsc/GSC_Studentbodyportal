import gscLogo from '@/assets/personal_assets/gsc_sbo_logo.png'
import { Settings, Clock, Mail } from 'lucide-react'

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-white p-2">
              <img src={gscLogo} alt="GSC Logo" className="h-16 w-16 object-contain" />
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-amber-100">
              <Settings className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Under Maintenance
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The Axis - Student Body Organization is currently undergoing scheduled maintenance. 
            We're working hard to improve your experience and will be back shortly.
          </p>

          {/* Additional Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Estimated downtime: 1-2 hours</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
              <Mail className="h-4 w-4" />
              <span>For urgent matters: sbo@gsc.edu.ph</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-amber-700">
              Maintenance in Progress
            </span>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              © 2026 The Axis - Student Body Organization. All rights reserved.
            </p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact the{' '}
            <a href="mailto:sbo@gsc.edu.ph" className="text-slate-600 hover:text-slate-800 font-medium underline">
              Student Body Organization Office
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
