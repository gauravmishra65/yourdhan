// ============================================================
// YourDhan – /login dedicated page
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

type Tab  = 'email' | 'google' | 'magic'
type Mode = 'signin' | 'signup'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

export default function LoginPage() {
  const navigate  = useNavigate()
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, sendMagicLink } = useAuthStore()

  const [tab,     setTab]     = useState<Tab>('email')
  const [mode,    setMode]    = useState<Mode>('signin')
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [name,    setName]    = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState('')
  const [info,    setInfo]    = useState('')
  const [magicSent, setMagicSent] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const reset = () => { setError(''); setInfo('') }

  const handleEmailSubmit = async () => {
    if (!email || !password) { setError('Email and password are required.'); return }
    setBusy(true); reset()
    const err = mode === 'signin'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, name)
    setBusy(false)
    if (err) { setError(err); return }
    if (mode === 'signup') {
      setInfo('Account created! Check your email to confirm, then sign in.')
      setMode('signin')
    } else {
      navigate('/', { replace: true })
    }
  }

  const handleGoogle = async () => {
    setBusy(true); reset()
    const err = await signInWithGoogle()
    setBusy(false)
    if (err) setError(err)
  }

  const handleMagicLink = async () => {
    if (!email) { setError('Please enter your email.'); return }
    setBusy(true); reset()
    const err = await sendMagicLink(email)
    setBusy(false)
    if (err) { setError(err); return }
    setMagicSent(true)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'email',  label: 'Email' },
    { id: 'google', label: 'Google' },
    { id: 'magic',  label: 'Magic Link' },
  ]

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4">
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
            <IndianRupee size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">YourDhan</h1>
          <p className="text-sm text-slate-500 mt-1">Smart Portfolio Analytics</p>
        </div>

        {/* Card */}
        <div className="bg-[#131929] border border-[#1e2d45] rounded-2xl overflow-hidden shadow-2xl">

          {/* Tab bar */}
          <div className="flex border-b border-[#1e2d45]">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); reset() }}
                className="flex-1 py-3 text-sm font-medium transition-colors relative"
                style={{ color: tab === t.id ? '#3b82f6' : '#64748b' }}
              >
                {t.label}
                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">

            {/* ── Email / Password ── */}
            {tab === 'email' && (
              <>
                <h2 className="text-base font-semibold text-slate-200">
                  {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                </h2>

                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Your name" autoFocus
                        className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg py-2.5 text-sm text-slate-200
                                   placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        style={{ paddingLeft: '34px' }} />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" autoFocus={mode === 'signin'}
                      onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                      className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg py-2.5 text-sm text-slate-200
                                 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      style={{ paddingLeft: '34px' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                      className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg py-2.5 text-sm text-slate-200
                                 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      style={{ paddingLeft: '34px', paddingRight: '36px' }} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
                {info  && <p className="text-xs text-green-400 bg-green-900/20 border border-green-800/40 rounded-lg px-3 py-2">{info}</p>}

                <button onClick={handleEmailSubmit} disabled={busy}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold
                             rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors text-sm">
                  {busy && <Loader2 size={15} className="animate-spin" />}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>

                <p className="text-center text-xs text-slate-500">
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); reset() }}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </>
            )}

            {/* ── Google ── */}
            {tab === 'google' && (
              <>
                <h2 className="text-base font-semibold text-slate-200">Sign in with Google</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  One click to sign in. You'll be redirected to Google and back.
                </p>
                {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
                <button onClick={handleGoogle} disabled={busy}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100
                             disabled:opacity-50 text-gray-800 font-semibold rounded-xl py-2.5 transition-colors text-sm">
                  {busy ? <Loader2 size={15} className="animate-spin text-gray-600" /> : <GoogleIcon />}
                  Continue with Google
                </button>
              </>
            )}

            {/* ── Magic Link ── */}
            {tab === 'magic' && (
              <>
                {magicSent ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center border border-green-700/40">
                      <CheckCircle2 size={28} className="text-green-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-200">Check your inbox</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Magic link sent to <span className="text-slate-300">{email}</span>.<br />
                        Click the link to sign in instantly.
                      </p>
                    </div>
                    <button onClick={() => setMagicSent(false)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      Use a different email
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-base font-semibold text-slate-200">Passwordless Sign In</h2>
                    <p className="text-sm text-slate-500">Enter your email and we'll send a sign-in link.</p>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com" autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                          className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg py-2.5 text-sm text-slate-200
                                     placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                          style={{ paddingLeft: '34px' }} />
                      </div>
                    </div>
                    {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
                    <button onClick={handleMagicLink} disabled={busy}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold
                                 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors text-sm">
                      {busy ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                      Send Magic Link
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          <button onClick={() => navigate('/')} className="hover:text-slate-400 transition-colors">
            ← Continue without signing in
          </button>
        </p>
      </div>
    </div>
  )
}
