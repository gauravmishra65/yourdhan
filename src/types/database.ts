// ============================================================
// YourDhan – Supabase Database Types  (auto-shape matches 001_initial_schema.sql)
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Row types (what the DB returns) ──────────────────────────────────────────

export interface DbSession {
  id: string                   // uuid
  device_hint: string | null
  created_at: string           // timestamptz
  last_active: string
}

export interface DbUserPreferences {
  session_id: string
  theme: 'dark' | 'light'
  risk_free_rate: number
  default_benchmark: string
  currency: string
  sidebar_open: boolean
  updated_at: string
}

export interface DbPortfolio {
  id: string
  session_id: string
  name: string
  description: string | null
  benchmark: 'SPY' | 'QQQ' | 'BND' | 'none'
  rebalance: 'none' | 'monthly' | 'quarterly' | 'annual'
  initial_amount: number
  start_year: number
  end_year: number
  risk_free_rate: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface DbPortfolioAsset {
  id: string
  portfolio_id: string
  symbol: string
  weight: number          // 0–100
  asset_class: string | null
  display_order: number
  created_at: string
}

export interface DbPortfolioSnapshot {
  id: string
  portfolio_id: string
  snapshot_date: string   // date (YYYY-MM-DD)
  total_value: number
  daily_pnl: number
  daily_pnl_pct: number
  cagr: number | null
  sharpe: number | null
  max_drawdown: number | null
  created_at: string
}

export interface DbWatchlistItem {
  id: string
  session_id: string
  symbol: string
  note: string | null
  added_at: string
}

export interface DbPriceAlert {
  id: string
  session_id: string
  ticker: string
  alert_type: 'above' | 'below' | 'pct_up' | 'pct_down'
  target_value: number
  current_ref: number | null
  is_active: boolean
  triggered_at: string | null
  notes: string | null
  created_at: string
}

export interface DbStockNote {
  id: string
  session_id: string
  ticker: string
  note: string
  sentiment: 'bullish' | 'bearish' | 'neutral' | null
  created_at: string
  updated_at: string
}

export interface DbScreenerPreset {
  id: string
  session_id: string
  name: string
  filters: Json
  is_default: boolean
  created_at: string
}

export interface DbComparePortfolio {
  id: string
  session_id: string
  name: string
  assets_json: Json         // Array<{ symbol: string; weight: number }>
  created_at: string
}

// ── portfolio_summary view ────────────────────────────────────────────────────

export interface DbPortfolioSummary extends DbPortfolio {
  asset_count: number
  total_weight: number
  assets: Array<{ symbol: string; weight: number }> | null
}

// ── Insert types (omit server-generated fields) ───────────────────────────────

export type DbPortfolioInsert = Omit<DbPortfolio, 'id' | 'created_at' | 'updated_at'>
export type DbPortfolioAssetInsert = Omit<DbPortfolioAsset, 'id' | 'created_at'>
export type DbWatchlistItemInsert = Omit<DbWatchlistItem, 'id' | 'added_at'>
export type DbPriceAlertInsert = Omit<DbPriceAlert, 'id' | 'created_at'>
export type DbStockNoteInsert = Omit<DbStockNote, 'id' | 'created_at' | 'updated_at'>
export type DbScreenerPresetInsert = Omit<DbScreenerPreset, 'id' | 'created_at'>
export type DbComparePortfolioInsert = Omit<DbComparePortfolio, 'id' | 'created_at'>

// ── Supabase Database generic type (used in createClient<Database>()) ─────────

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: DbSession
        Insert: Omit<DbSession, 'created_at' | 'last_active'>
        Update: Partial<DbSession>
      }
      user_preferences: {
        Row: DbUserPreferences
        Insert: DbUserPreferences
        Update: Partial<DbUserPreferences>
      }
      portfolios: {
        Row: DbPortfolio
        Insert: DbPortfolioInsert
        Update: Partial<DbPortfolio>
      }
      portfolio_assets: {
        Row: DbPortfolioAsset
        Insert: DbPortfolioAssetInsert
        Update: Partial<DbPortfolioAsset>
      }
      portfolio_snapshots: {
        Row: DbPortfolioSnapshot
        Insert: Omit<DbPortfolioSnapshot, 'id' | 'created_at'>
        Update: Partial<DbPortfolioSnapshot>
      }
      watchlist_items: {
        Row: DbWatchlistItem
        Insert: DbWatchlistItemInsert
        Update: Partial<DbWatchlistItem>
      }
      price_alerts: {
        Row: DbPriceAlert
        Insert: DbPriceAlertInsert
        Update: Partial<DbPriceAlert>
      }
      stock_notes: {
        Row: DbStockNote
        Insert: DbStockNoteInsert
        Update: Partial<DbStockNote>
      }
      screener_presets: {
        Row: DbScreenerPreset
        Insert: DbScreenerPresetInsert
        Update: Partial<DbScreenerPreset>
      }
      compare_portfolios: {
        Row: DbComparePortfolio
        Insert: DbComparePortfolioInsert
        Update: Partial<DbComparePortfolio>
      }
    }
    Views: {
      portfolio_summary: {
        Row: DbPortfolioSummary
      }
    }
    Functions: {
      set_session_context: {
        Args: { session_id: string }
        Returns: void
      }
      upsert_session: {
        Args: { p_id: string; p_hint?: string }
        Returns: string
      }
    }
  }
}
