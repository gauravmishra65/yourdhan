import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          deepest: '#0b0f1a',
          card: '#131929',
          elevated: '#1a2235',
          hover: '#1e2a40',
        },
        accent: {
          blue: '#3b82f6',
          indigo: '#6366f1',
        },
        gain: '#22c55e',
        loss: '#ef4444',
        warning: '#f59e0b',
        border: '#1e2d45',
        chart: {
          1: '#3b82f6',
          2: '#22c55e',
          3: '#f59e0b',
          4: '#a855f7',
          5: '#06b6d4',
          6: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config
