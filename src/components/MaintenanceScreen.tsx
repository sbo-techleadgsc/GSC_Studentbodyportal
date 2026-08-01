import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site'

// Defining a clear interface blocks Vite from getting confused by the colon symbol
interface MaintenanceProps {
  message: string
}

export function MaintenanceScreen(props: MaintenanceProps) {
  const { message } = props; // Destructure safely inside the function body

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center">
      <img
        src="/gsc_logo.svg"
        alt={siteConfig.schoolName}
        className="h-16 w-16"
      />
      <h1 className="mt-6 text-2xl font-extrabold text-white sm:text-3xl">
        {siteConfig.orgShortName} is down for maintenance
      </h1>
      <p className="mt-3 max-w-md text-[15px] text-navy-100/75">{message}</p>
      
      <Link
        to="/admin/login"
        aria-label="Admin sign in"
        className="absolute bottom-6 left-6 rounded-md p-2 text-navy-100/30 transition-colors hover:bg-white/5 hover:text-navy-100/80"
      >
        <svg 
          xmlns="http://w3.org" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-5 w-5"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </Link>
    </div>
  )
}
