import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getWatchlist,
  addToWatchlist as dbAdd,
  removeFromWatchlist as dbRemove,
  syncWatchlist,
} from '../lib/supabaseService'

interface WatchlistState {
  symbols:   string[]
  synced:    boolean          // true = Supabase in sync

  addSymbol:    (symbol: string) => void
  removeSymbol: (symbol: string) => void
  hasSymbol:    (symbol: string) => boolean
  clearAll:     () => void

  // Supabase sync
  loadFromCloud:  () => Promise<void>
  pushToCloud:    () => Promise<void>
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
      synced:  false,

      addSymbol: (symbol) => {
        set((s) => ({
          symbols: s.symbols.includes(symbol)
            ? s.symbols
            : [...s.symbols, symbol.toUpperCase()],
          synced: false,
        }))
        // fire-and-forget cloud sync
        dbAdd(symbol).catch(() => {})
      },

      removeSymbol: (symbol) => {
        set((s) => ({ symbols: s.symbols.filter((s2) => s2 !== symbol), synced: false }))
        dbRemove(symbol).catch(() => {})
      },

      hasSymbol: (symbol) => get().symbols.includes(symbol),

      clearAll: () => {
        set({ symbols: [], synced: false })
        syncWatchlist([]).catch(() => {})
      },

      // ── Supabase: pull from DB (on app start / reconnect) ────────────────
      loadFromCloud: async () => {
        const rows = await getWatchlist()
        if (!rows) return     // offline — keep local
        const symbols = rows.map((r) => r.symbol)
        set({ symbols, synced: true })
      },

      // ── Supabase: push local → DB (full replace) ─────────────────────────
      pushToCloud: async () => {
        const ok = await syncWatchlist(get().symbols)
        if (ok) set({ synced: true })
      },
    }),
    { name: 'yourdhan-watchlist', partialize: (s) => ({ symbols: s.symbols }) }
  )
)
