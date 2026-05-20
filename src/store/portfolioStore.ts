import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asset, PortfolioSettings, BacktestResults } from '../types';

interface PortfolioState {
  assets: Asset[];
  settings: PortfolioSettings;
  backtestResults: BacktestResults | null;
  comparePortfolios: Array<{ id: string; name: string; assets: Asset[] }>;

  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (symbol: string) => void;
  updateAssetWeight: (symbol: string, weight: number) => void;
  setSettings: (settings: Partial<PortfolioSettings>) => void;
  setBacktestResults: (results: BacktestResults | null) => void;
  addComparePortfolio: (portfolio: { id: string; name: string; assets: Asset[] }) => void;
  removeComparePortfolio: (id: string) => void;
  clearComparePortfolios: () => void;
  normalizeWeights: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      assets: [
        { symbol: 'SPY', weight: 60 },
        { symbol: 'BND', weight: 40 },
      ],
      settings: {
        startYear: 2000,
        endYear: 2024,
        rebalance: 'annual',
        riskFreeRate: 0.06,
        benchmark: 'SPY',
        initialAmount: 100000,
      },
      backtestResults: null,
      comparePortfolios: [],

      setAssets: (assets) => set({ assets }),
      addAsset: (asset) => set((s) => ({ assets: [...s.assets, asset] })),
      removeAsset: (symbol) =>
        set((s) => ({ assets: s.assets.filter((a) => a.symbol !== symbol) })),
      updateAssetWeight: (symbol, weight) =>
        set((s) => ({
          assets: s.assets.map((a) => (a.symbol === symbol ? { ...a, weight } : a)),
        })),
      setSettings: (settings) =>
        set((s) => ({ settings: { ...s.settings, ...settings } })),
      setBacktestResults: (results) => set({ backtestResults: results }),
      addComparePortfolio: (p) =>
        set((s) => ({ comparePortfolios: [...s.comparePortfolios.slice(-2), p] })),
      removeComparePortfolio: (id) =>
        set((s) => ({
          comparePortfolios: s.comparePortfolios.filter((p) => p.id !== id),
        })),
      clearComparePortfolios: () => set({ comparePortfolios: [] }),
      normalizeWeights: () =>
        set((s) => {
          const total = s.assets.reduce((sum, a) => sum + a.weight, 0);
          if (total === 0) return s;
          return {
            assets: s.assets.map((a) => ({ ...a, weight: (a.weight / total) * 100 })),
          };
        }),
    }),
    { name: 'yourdhan-portfolio' }
  )
);
