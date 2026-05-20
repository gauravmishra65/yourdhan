import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initSupabaseSession } from './lib/session'

// Init anonymous Supabase session (non-blocking — app works offline too)
initSupabaseSession().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
