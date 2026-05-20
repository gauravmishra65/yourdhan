// ============================================================
// YourDhan – PremiumGate
// Overlay shown on premium analysis pages when user is not logged in.
// Renders children underneath a blurred overlay with a sign-in CTA.
// ============================================================
import { useState } from 'react'
import { Lock, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import AuthModal from './AuthModal'

interface PremiumGateProps {
  children: React.ReactNode
  /** Tool name shown in the overlay, e.g. "Portfolio Optimization" */
  toolName: string
  /** Short description of what the tool does */
  description?: string
}

const BENEFITS = [
  { icon: TrendingUp,   text: 'Advanced portfolio optimisation' },
  { icon: ShieldCheck,  text: 'Monte Carlo & risk simulations' },
  { icon: Zap,          text: 'Factor & drawdown analysis' },
  { icon: Sparkles,     text: 'Cloud sync across devices' },
]

export default function PremiumGate({ children, toolName, description }: PremiumGateProps) {
  const { user } = useAuthStore()
  const [showModal, setShowModal] = useState(false)

  // If user is logged in, render children normally
  if (user) return <>{children}</>

  return (
    <div style={{ position: 'relative', minHeight: '60vh' }}>
      {/* Blurred preview of the actual tool */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}>
        {children}
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, rgba(11,15,26,0.5) 0%, rgba(11,15,26,0.92) 40%)',
          zIndex: 10,
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            background: '#131929',
            border: '1px solid #1e2d45',
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            padding: '32px 28px',
            textAlign: 'center',
          }}
        >
          {/* Lock icon */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))',
              border: '1px solid rgba(59,130,246,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Lock size={24} color="#60a5fa" />
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
            {toolName} is a premium tool
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
            {description || 'Sign in for free to unlock this tool and all premium analytics features.'}
          </p>

          {/* Benefits list */}
          <div
            style={{
              background: '#0b0f1a',
              border: '1px solid #1e2d45',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 0',
                  color: '#94a3b8',
                  fontSize: '12px',
                }}
              >
                <Icon size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
                {text}
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              Sign In — It's Free
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid #1e2d45',
                borderRadius: '12px',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'
                ;(e.currentTarget as HTMLElement).style.color = '#94a3b8'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1e2d45'
                ;(e.currentTarget as HTMLElement).style.color = '#64748b'
              }}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
