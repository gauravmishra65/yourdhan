// ============================================================
// YourDhan – Anonymous Session Manager
// ============================================================

import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'

const SESSION_KEY = 'yourdhan-session-id'

export function getDeviceId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = uuidv4()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export async function initSupabaseSession(): Promise<string> {
  const id = getDeviceId()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('upsert_session', {
      p_id:   id,
      p_hint: navigator.userAgent.slice(0, 80),
    })
  } catch {
    // offline — app works from localStorage
  }
  return id
}

export async function withSession<T>(fn: () => Promise<T>): Promise<T> {
  const id = getDeviceId()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('set_session_context', { session_id: id })
  } catch {
    // ignore when offline
  }
  return fn()
}
