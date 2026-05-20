import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, PortfolioSettings, BacktestResults } from '../types'
import {
  listPortfolios,
  createPortfolio,
  replacePortfolioAssets,
  updatePortfolioMeta,
  deletePortfolio as dbDeletePortfolio,
  saveSnapshot,
  getComparePortfolios,
  saveComparePortfolio,
  deleteComparePortfolio as dbDeleteComparePortfolio,
} from '../lib/supabaseService'
import type { DbPortfolioSummary, DbComparePortfolio } from '../types/database'

interface PortfolioState {
  // ── local state (synced to localStorage + Supabase) ──
  assets:    Asset[]
  settings:  PortfolioSettings
  backtestResults: BacktestResults | null
  comparePortfolios: Array<{ id: string; name: string; assets: Asset[] }>

  // ── cloud portfolios (fetched from Supabase) ──
  cloudPortfolios: DbPortfolioSummary[]
  cloudLoading:    boolean
  activeCloudiD:   string | null   // which saved portfolio is "loaded"

  // ── local actions ──
  setAssets:           (assets: Asset[]) => void
  addAsset:            (asset: Asset) => void
  removeAsset:         (symbol: string) => void
  updateAssetWeight:   (symbol: string, weight: number) => void
  setSettings:         (settings: Partial<PortfolioSettings>) => void
  setBacktestResults:  (results: BacktestResults | null) => void
  normalizeWeights:    () => void

  // ── compare (local) ──
  addComparePortfolio:     (portfolio: { id: string; name: string; assets: Asset[] }) => void
  removeComparePortfolio:  (id: string) => void
  clearComparePortfolios:  () => void

  // ── Supabase sync actions ──
  loadCloudPortfolios:   () => Promise<void>
  saveToCloud:           (name: string) => Promise<string | null>
  loadFromCloud:         (portfolio: DbPortfolioSummary) => void
  deleteFromCloud:       (id: string) => Promise<void>
  pushSnapshotToCloud:   () => Promise<void>
  syncCompareToCloud:    () => Promise<void>
  loadCompareFromCloud:  () => Promise<void>
}

const DEFAULT_ASSETS: Asset[] = [
  { symbol: 'SPY', weight: 60 },
  { symbol: 'BND', weight: 40 },
]

const DEFAULT_SETTINGS: PortfolioSettings = {
  startYear:     2000,
  endYear:       2024,
  rebalance:     'annual',
  riskFreeRate:  0.06,
  benchmark:     'SPY',
  initialAmount: 100000,
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      assets:            DEFAULT_ASSETS,
      settings:          DEFAULT_SETTINGS,
      backtestResults:   null,
      comparePortfolios: [],
      cloudPortfolios:   [],
      cloudLoading:      false,
      activeCloudiD:     null,

      // ── local actions ────────────────────────────────────────────────────
      setAssets: (assets) => set({ assets }),
      addAsset:  (asset)  => set((s) => ({ assets: [...s.assets, asset] })),
      removeAsset: (symbol) =>
        set((s) => ({ assets: s.assets.filter((a) => a.symbol !== symbol) })),
      updateAssetWeight: (symbol, weight) =>
        set((s) => ({
          assets: s.assets.map((a) => (a.symbol === symbol ? { ...a, weight } : a)),
        })),
      setSettings: (settings) =>
        set((s) => ({ settings: { ...s.settings, ...settings } })),
      setBacktestResults: (results) => set({ backtestResults: results }),
      normalizeWeights: () =>
        set((s) => {
          const total = s.assets.reduce((sum, a) => sum + a.weight, 0)
          if (total === 0) return s
          return { assets: s.assets.map((a) => ({ ...a, weight: (a.weight / total) * 100 })) }
        }),

      // ── compare (local) ──────────────────────────────────────────────────
      addComparePortfolio: (p) =>
        set((s) => ({ comparePortfolios: [...s.comparePortfolios.slice(-2), p] })),
      removeComparePortfolio: (id) =>
        set((s) => ({ comparePortfolios: s.comparePortfolios.filter((p) => p.id !== id) })),
      clearComparePortfolios: () => set({ comparePortfolios: [] }),

      // ── Supabase: list portfolios ────────────────────────────────────────
      loadCloudPortfolios: async () => {
        set({ cloudLoading: true })
        const portfolios = await listPortfolios()
        set({ cloudPortfolios: portfolios ?? [], cloudLoading: false })
      },

      // ── Supabase: save current state as a new portfolio ──────────────────
      saveToCloud: async (name: string) => {
        const { assets, settings } = get()
        const created = await createPortfolio(name, assets, settings)
        if (created) {
          await get().loadCloudPortfolios()
          set({ activeCloudiD: created.id })
          return created.id
        }
        return null
      },

      // ── Supabase: load a saved portfolio into the editor ─────────────────
      loadFromCloud: (portfolio: DbPortfolioSummary) => {
        const assets: Asset[] = (portfolio.assets ?? []).map((a) => ({
          symbol: a.symbol,
          weight: a.weight,
        }))
        set({
          assets,
          settings: {
            startYear:     portfolio.start_year,
            endYear:       portfolio.end_year,
            rebalance:     portfolio.rebalance,
            riskFreeRate:  portfolio.risk_free_rate,
            benchmark:     portfolio.benchmark,
            initialAmount: portfolio.initial_amount,
          },
          activeCloudiD:  portfolio.id,
          backtestResults: null,
        })
      },

      // ── Supabase: delete a saved portfolio ───────────────────────────────
      deleteFromCloud: async (id: string) => {
        await dbDeletePortfolio(id)
        set((s) => ({
          cloudPortfolios: s.cloudPortfolios.filter((p) => p.id !== id),
          activeCloudiD:   s.activeCloudiD === id ? null : s.activeCloudiD,
        }))
      },

      // ── Supabase: save backtest NAV as today's snapshot ──────────────────
      pushSnapshotToCloud: async () => {
        const { activeCloudiD, backtestResults } = get()
        if (!activeCloudiD || !backtestResults) return
        const lastValue = backtestResults.portfolioValues.at(-1) ?? 0
        await saveSnapshot(activeCloudiD, lastValue, {
          cagr:        backtestResults.metrics.cagr,
          sharpe:      backtestResults.metrics.sharpe,
          maxDrawdown: backtestResults.metrics.maxDrawdown,
        })
      },

      // ── Supabase: sync compare portfolios ────────────────────────────────
      syncCompareToCloud: async () => {
        const { comparePortfolios } = get()
        for (const p of comparePortfolios) {
          await saveComparePortfolio(p.name, p.assets)
        }
      },

      loadCompareFromCloud: async () => {
        const rows = await getComparePortfolios()
        if (!rows) return
        const mapped = rows.map((r: DbComparePortfolio) => ({
          id:     r.id,
          name:   r.name,
          assets: (r.assets_json as unknown as Asset[]) ?? [],
        }))
        set({ comparePortfolios: mapped.slice(-3) })
      },
    }),
    { name: 'yourdhan-portfolio', partialize: (s) => ({
        assets:            s.assets,
        settings:          s.settings,
        comparePortfolios: s.comparePortfolios,
        activeCloudiD:     s.activeCloudiD,
      })
    }
  )
)
