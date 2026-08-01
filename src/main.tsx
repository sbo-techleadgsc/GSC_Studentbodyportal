import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Maintenance from './pages/Maintenance.tsx'

// Check if maintenance mode is enabled via environment variable
const isUnderMaintenance = import.meta.env.VITE_UNDER_MAINTENANCE === 'true'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isUnderMaintenance ? <Maintenance /> : <App />}
  </StrictMode>,
)
