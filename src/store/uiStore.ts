import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PriceAlert } from '../types';

interface UIState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  alerts: PriceAlert[];

  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addAlert: (alert: PriceAlert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  markAlertTriggered: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      alerts: [],

      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark', next === 'dark');
          document.documentElement.classList.toggle('light', next === 'light');
          return { theme: next };
        }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),
      removeAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      toggleAlert: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        })),
      markAlertTriggered: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, triggered: true } : a
          ),
        })),
    }),
    { name: 'yourdhan-ui' }
  )
);
