// ============================================================
// YourDhan – Price Store (Zustand)
// Holds live quotes fetched from Yahoo Finance + mfapi.in.
// Falls back gracefully to mock prices from the universe when
// live data hasn't loaded yet or a symbol isn't covered.
// ============================================================
import { create } from 'zustand'
import type { LiveQuote, FetchTarget } from '../services/liveDataService'
import { fetchLivePrices, hasFreshCache, minutesSinceRefresh } from '../services/liveDataService'

interface PriceState {
  // ── State ─────────────────────────────────────────────────
  quotes:      Record<string, LiveQuote>
  loading:     boolean
  lastUpdated: Date | null
  error:       string | null
  liveEnabled: boolean   // true after first successful network fetch

  // ── Actions ───────────────────────────────────────────────
  /** Fetch prices for all items. Call once on mount; auto-refreshes every 5 min. */
  initPrices:   (items: FetchTarget[]) => Promise<void>
  /** Force refresh – ignores cache. */
  refreshPrices:(items: FetchTarget[]) => Promise<void>
  /** Returns live price if available, else falls back to the mock price. */
  getPrice:     (symbol: string, mockPrice: number) => number
  /** Returns live % change if available, else falls back. */
  getChgPct:    (symbol: string, mockChg: number)  => number
  /** Returns full live quote if available. */
  getQuote:     (symbol: string) => LiveQuote | null
  /** How long ago prices were last fetched (human-readable). */
  freshness:    () => string
}

export const usePriceStore = create<PriceState>()((set, get) => ({
  quotes:      {},
  loading:     false,
  lastUpdated: null,
  error:       null,
  liveEnabled: false,

  initPrices: async (items) => {
    // If fresh cache exists, load from it immediately (no spinner)
    if (hasFreshCache()) {
      const cached = await fetchLivePrices(items, false)
      if (Object.keys(cached).length > 0) {
        set({ quotes: cached, liveEnabled: true, lastUpdated: new Date(), error: null })
      }
    }
    // Always kick off a network fetch in the background
    get().refreshPrices(items)
  },

  refreshPrices: async (items) => {
    set({ loading: true, error: null })
    try {
      const quotes = await fetchLivePrices(items, true)
      if (Object.keys(quotes).length > 0) {
        set({ quotes, loading: false, lastUpdated: new Date(), liveEnabled: true, error: null })
      } else {
        // Empty result — Edge Function not deployed or market closed
        set({ loading: false, error: 'Live prices unavailable — using mock data' })
      }
    } catch (e) {
      set({ loading: false, error: `Live prices unavailable: ${String(e)}` })
    }
  },

  getPrice: (symbol, mockPrice) => {
    const q = get().quotes[symbol]
    return q && q.price > 0 ? q.price : mockPrice
  },

  getChgPct: (symbol, mockChg) => {
    const q = get().quotes[symbol]
    return q ? q.chgPct : mockChg
  },

  getQuote: (symbol) => get().quotes[symbol] ?? null,

  freshness: () => {
    const mins = minutesSinceRefresh()
    if (mins === null) return 'Never refreshed'
    if (mins === 0)    return 'Just now'
    if (mins === 1)    return '1 min ago'
    return `${mins} min ago`
  },
}))
