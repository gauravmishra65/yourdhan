// ============================================================
// YourDhan – AuthModal
// Tabs: Email/Password  ·  Google OAuth  ·  Magic Link
// ============================================================
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, IndianRupee } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface AuthModalProps {
  onClose:       () => void
  defaultTab?:   'email' | 'google' | 'magic'
  defaultMode?:  'signin' | 'signup'
}

type Tab  = 'email' | 'google' | 'magic'
type Mode = 'signin' | 'signup'

// ── Google icon SVG ───────────────────────────────────────────────────────────
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

// ── Input field helper ────────────────────────────────────────────────────────
function Field({
  label, type, value, onChange, placeholder, icon: Icon, showToggle, onToggle, autoFocus,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  showToggle?: boolean
  onToggle?: () => void
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-3 py-2.5 text-sm text-slate-200
                     placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          style={{ paddingLeft: Icon ? '34px' : undefined, paddingRight: showToggle ? '36px' : undefined }}
        />
        {showToggle && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {type === 'password' ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Email / Password tab ──────────────────────────────────────────────────────
function EmailTab({ mode, setMode, onSuccess }: {
  mode: Mode
  setMode: (m: Mode) => void
  onSuccess: () => void
}) {
  const { signInWithEmail, signUpWithEmail } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState('')
  const [info,     setInfo]     = useState('')  // "check your email" message

  const submit = async () => {
    if (!email || !password) { setError('Email and password are required.'); return }
    if (mode === 'signup' && password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setBusy(true); setError(''); setInfo('')
    const err = mode === 'signin'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, name)
    setBusy(false)
    if (err) { setError(err); return }
    if (mode === 'signup') {
      setInfo('Account created! Check your email to confirm, then sign in.')
      setMode('signin')
    } else {
      onSuccess()
    }
  }

  return (
    <div className="space-y-4">
      {mode === 'signup' && (
        <Field label="Full Name" type="text" value={name} onChange={setName}
          placeholder="Your name" icon={User} autoFocus />
      )}
      <Field label="Email" type="email" value={email} onChange={setEmail}
        placeholder="you@example.com" icon={Mail} autoFocus={mode === 'signin'} />
      <Field label="Password" type={showPw ? 'text' : 'password'} value={password}
        onChange={setPassword} placeholder="••••••••" icon={Lock}
        showToggle onToggle={() => setShowPw(p => !p)} />

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>
      )}
      {info && (
        <p className="text-xs text-green-400 bg-green-900/20 border border-green-800/40 rounded-lg px-3 py-2">{info}</p>
      )}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                   text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2
                   transition-colors text-sm"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : null}
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </button>

      <p className="text-center text-xs text-slate-500">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          {mode === 'signin' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  )
}

// ── Google tab ────────────────────────────────────────────────────────────────
function GoogleTab() {
  const { signInWithGoogle } = useAuthStore()
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')

  const go = async () => {
    setBusy(true); setError('')
    const err = await signInWithGoogle()
    setBusy(false)
    if (err) setError(err)
    // Success: Supabase redirects to /auth/callback
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 text-center leading-relaxed">
        Click below to sign in with your Google account.<br />
        <span className="text-slate-600 text-xs">You'll be redirected to Google, then back here.</span>
      </p>

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={go}
        disabled={busy}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100
                   disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-semibold
                   rounded-xl py-2.5 transition-colors text-sm"
      >
        {busy ? <Loader2 size={15} className="animate-spin text-gray-600" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <p className="text-xs text-slate-600 text-center">
        Requires Google OAuth to be enabled in your Supabase project settings.
      </p>
    </div>
  )
}

// ── Magic Link tab ────────────────────────────────────────────────────────────
function MagicLinkTab() {
  const { sendMagicLink } = useAuthStore()
  const [email, setEmail] = useState('')
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')
  const [sent,  setSent]  = useState(false)

  const send = async () => {
    if (!email) { setError('Please enter your email.'); return }
    setBusy(true); setError('')
    const err = await sendMagicLink(email)
    setBusy(false)
    if (err) { setError(err); return }
    setSent(true)
  }

  if (sent) return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center border border-green-700/40">
        <CheckCircle2 size={28} className="text-green-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-200">Check your inbox</p>
        <p className="text-xs text-slate-500 mt-1">
          We sent a magic link to <span className="text-slate-300">{email}</span>.<br />
          Click it to sign in instantly — no password needed.
        </p>
      </div>
      <button onClick={() => setSent(false)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
        Use a different email
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 text-center">
        Enter your email and we'll send a one-click sign-in link.
      </p>
      <Field label="Email" type="email" value={email} onChange={setEmail}
        placeholder="you@example.com" icon={Mail} autoFocus />

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={send}
        disabled={busy}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                   text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2
                   transition-colors text-sm"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
        Send Magic Link
      </button>
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AuthModal({ onClose, defaultTab = 'email', defaultMode = 'signin' }: AuthModalProps) {
  const [tab,  setTab]  = useState<Tab>(defaultTab)
  const [mode, setMode] = useState<Mode>(defaultMode)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'email',  label: 'Email' },
    { id: 'google', label: 'Google' },
    { id: 'magic',  label: 'Magic Link' },
  ]

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{ width: '100%', maxWidth: '420px', background: '#131929', border: '1px solid #1e2d45', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#1e2d45]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
              <IndianRupee size={16} color="white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-[11px] text-slate-500">YourDhan — Smart Portfolio Analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-[#1e2d45]">
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#1e2d45]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 text-xs font-medium transition-colors relative"
              style={{ color: tab === t.id ? '#3b82f6' : '#64748b' }}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-5">
          {tab === 'email'  && <EmailTab mode={mode} setMode={setMode} onSuccess={onClose} />}
          {tab === 'google' && <GoogleTab />}
          {tab === 'magic'  && <MagicLinkTab />}
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 text-center">
          <p className="text-[10px] text-slate-600">
            By continuing you agree to our{' '}
            <span className="text-slate-500 cursor-pointer hover:text-slate-400">Terms</span>
            {' '}and{' '}
            <span className="text-slate-500 cursor-pointer hover:text-slate-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
