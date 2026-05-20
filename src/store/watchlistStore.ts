import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  hasSymbol: (symbol: string) => boolean;
  clearAll: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: ['SPY', 'QQQ', 'AAPL', 'MSFT'],
      addSymbol: (symbol) =>
        set((s) => ({
          symbols: s.symbols.includes(symbol)
            ? s.symbols
            : [...s.symbols, symbol.toUpperCase()],
        })),
      removeSymbol: (symbol) =>
        set((s) => ({ symbols: s.symbols.filter((s2) => s2 !== symbol) })),
      hasSymbol: (symbol) => get().symbols.includes(symbol),
      clearAll: () => set({ symbols: [] }),
    }),
    { name: 'yourdhan-watchlist' }
  )
);
