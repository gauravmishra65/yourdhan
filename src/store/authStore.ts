// ============================================================
// YourDhan – Auth Store (Supabase Auth)
// Supports: Email+Password, Google OAuth, Magic Link
// ============================================================
import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user:    User | null
  session: Session | null
  loading: boolean          // true while checking initial session

  // actions
  initialize:       () => Promise<void>
  signInWithEmail:  (email: string, password: string) => Promise<string | null>
  signUpWithEmail:  (email: string, password: string, name?: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  sendMagicLink:    (email: string) => Promise<string | null>
  signOut:          () => Promise<void>
}

// Friendly error messages
function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.'
  if (msg.includes('Email not confirmed'))        return 'Please verify your email first.'
  if (msg.includes('User already registered'))    return 'An account with this email already exists.'
  if (msg.includes('Password should be'))         return 'Password must be at least 6 characters.'
  if (msg.includes('rate limit'))                 return 'Too many attempts — please wait a moment.'
  return msg
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user:    null,
  session: null,
  loading: true,

  // ── Called once on app mount ──────────────────────────────────────────────
  initialize: async () => {
    // Get existing session from storage
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })

    // Listen for future auth state changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  // ── Email + Password sign-in ──────────────────────────────────────────────
  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? friendlyError(error.message) : null
  },

  // ── Email + Password sign-up ──────────────────────────────────────────────
  signUpWithEmail: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name ?? '' } },
    })
    return error ? friendlyError(error.message) : null
  },

  // ── Google OAuth ──────────────────────────────────────────────────────────
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    return error ? friendlyError(error.message) : null
  },

  // ── Magic Link (passwordless email OTP) ───────────────────────────────────
  sendMagicLink: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    return error ? friendlyError(error.message) : null
  },

  // ── Sign out ──────────────────────────────────────────────────────────────
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
