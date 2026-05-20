// ============================================================
// YourDhan – /auth/callback
// Handles OAuth (Google) and Magic Link redirects from Supabase
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Supabase automatically parses the URL hash / query params and
    // fires onAuthStateChange. We just need to wait for the session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success')
        setMessage(`Welcome${session.user.user_metadata?.full_name ? `, ${session.user.user_metadata.full_name}` : ''}!`)
        setTimeout(() => navigate('/', { replace: true }), 1200)
      } else if (event === 'USER_UPDATED') {
        navigate('/', { replace: true })
      }
    })

    // Also check for error in URL params (e.g. OAuth denied)
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))
    const error = params.get('error') || hashParams.get('error')
    const errorDescription = params.get('error_description') || hashParams.get('error_description')

    if (error) {
      setStatus('error')
      setMessage(errorDescription?.replace(/\+/g, ' ') || 'Authentication failed. Please try again.')
    }

    // Timeout fallback — if no auth event fires in 8s, check session manually
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/', { replace: true })
      } else if (status === 'loading') {
        setStatus('error')
        setMessage('Sign-in timed out. Please try again.')
      }
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate, status])

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">

        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
          <IndianRupee size={28} color="white" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 size={36} className="text-blue-400 animate-spin" />
            <div>
              <p className="text-slate-200 font-semibold">Signing you in…</p>
              <p className="text-slate-500 text-sm mt-1">Please wait a moment</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={40} className="text-green-400" />
            <div>
              <p className="text-slate-200 font-semibold">{message}</p>
              <p className="text-slate-500 text-sm mt-1">Redirecting to dashboard…</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={40} className="text-red-400" />
            <div>
              <p className="text-slate-200 font-semibold">Authentication error</p>
              <p className="text-slate-500 text-sm mt-1">{message}</p>
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  )
}
