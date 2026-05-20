import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PriceAlert } from '../types'
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert as dbDeleteAlert,
  triggerAlert as dbTriggerAlert,
  getPreferences,
  upsertPreferences,
} from '../lib/supabaseService'
import type { DbPriceAlert } from '../types/database'

interface UIState {
  theme:       'dark' | 'light'
  sidebarOpen: boolean
  alerts:      PriceAlert[]

  toggleTheme:        () => void
  setTheme:           (theme: 'dark' | 'light') => void
  toggleSidebar:      () => void
  setSidebarOpen:     (open: boolean) => void

  // Alerts (local + Supabase)
  addAlert:           (alert: PriceAlert) => void
  removeAlert:        (id: string) => void
  toggleAlert:        (id: string) => void
  markAlertTriggered: (id: string) => void

  // Supabase sync
  loadPrefsFromCloud:  () => Promise<void>
  pushPrefsToCloud:    () => Promise<void>
  loadAlertsFromCloud: () => Promise<void>
  addAlertToCloud:     (
    ticker: string,
    alertType: DbPriceAlert['alert_type'],
    targetValue: number,
    currentRef?: number,
    notes?: string
  ) => Promise<PriceAlert | null>
}

function dbAlertToLocal(a: DbPriceAlert): PriceAlert {
  return {
    id:          a.id,
    ticker:      a.ticker,
    condition:   a.alert_type === 'above' ? 'PRICE_ABOVE'
                : a.alert_type === 'below' ? 'PRICE_BELOW'
                : 'PRICE_ABOVE',
    targetPrice: a.target_value,
    isActive:    a.is_active,
    triggered:   !!a.triggered_at,
    createdAt:   a.created_at,
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme:       'dark',
      sidebarOpen: true,
      alerts:      [],

      // ── Theme ──────────────────────────────────────────────────────────────
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.toggle('dark',  next === 'dark')
          document.documentElement.classList.toggle('light', next === 'light')
          return { theme: next }
        }),
      setTheme: (theme) => set({ theme }),

      // ── Sidebar ────────────────────────────────────────────────────────────
      toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ── Alerts (local) ─────────────────────────────────────────────────────
      addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),

      removeAlert: (id) => {
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) }))
        dbDeleteAlert(id).catch(() => {})
      },

      toggleAlert: (id) => {
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
        }))
        const alert = get().alerts.find((a) => a.id === id)
        if (alert) updateAlert(id, { is_active: !alert.isActive }).catch(() => {})
      },

      markAlertTriggered: (id) => {
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, triggered: true, isActive: false } : a
          ),
        }))
        dbTriggerAlert(id).catch(() => {})
      },

      // ── Supabase: preferences ──────────────────────────────────────────────
      loadPrefsFromCloud: async () => {
        const prefs = await getPreferences()
        if (!prefs) return
        set({ theme: prefs.theme, sidebarOpen: prefs.sidebar_open })
        document.documentElement.classList.toggle('dark',  prefs.theme === 'dark')
        document.documentElement.classList.toggle('light', prefs.theme === 'light')
      },

      pushPrefsToCloud: async () => {
        const { theme, sidebarOpen } = get()
        await upsertPreferences({ theme, sidebar_open: sidebarOpen })
      },

      // ── Supabase: alerts ───────────────────────────────────────────────────
      loadAlertsFromCloud: async () => {
        const rows = await getAlerts()
        if (!rows) return
        set({ alerts: rows.map(dbAlertToLocal) })
      },

      addAlertToCloud: async (ticker, alertType, targetValue, currentRef, notes) => {
        const row = await createAlert(ticker, alertType, targetValue, currentRef, notes)
        if (!row) return null
        const local = dbAlertToLocal(row)
        set((s) => ({ alerts: [local, ...s.alerts] }))
        return local
      },
    }),
    { name: 'yourdhan-ui', partialize: (s) => ({
        theme:       s.theme,
        sidebarOpen: s.sidebarOpen,
        alerts:      s.alerts,
      })
    }
  )
)
