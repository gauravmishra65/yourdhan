// ============================================================
// YourDhan – Supabase Service Layer
// All DB access goes through these typed functions.
// Falls back gracefully when offline (returns null).
// ============================================================

import { supabase } from './supabase'
import { getDeviceId } from './session'
import type {
  DbPortfolio,
  DbPortfolioAsset,
  DbPortfolioSummary,
  DbPortfolioSnapshot,
  DbWatchlistItem,
  DbPriceAlert,
  DbStockNote,
  DbScreenerPreset,
  DbComparePortfolio,
  DbUserPreferences,
  DbPortfolioInsert,
} from '../types/database'
import type { Asset, PortfolioSettings } from '../types'

// ── Tiny helper: run a query and return typed data or null on error ───────────

function sid() { return getDeviceId() }

async function run<T>(
  fn: () => PromiseLike<{ data: unknown; error: unknown }>
): Promise<T | null> {
  try {
    // Set the postgres context for RLS before every call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('set_session_context', { session_id: sid() })
    const { data, error } = await fn()
    if (error) { console.warn('[supabaseService]', error); return null }
    return data as T
  } catch {
    return null  // offline — caller falls back to localStorage
  }
}

// ── USER PREFERENCES ─────────────────────────────────────────────────────────

export async function getPreferences(): Promise<DbUserPreferences | null> {
  return run<DbUserPreferences>(() =>
    supabase.from('user_preferences').select('*').eq('session_id', sid()).single()
  )
}

export async function upsertPreferences(
  prefs: Partial<Omit<DbUserPreferences, 'session_id'>>
): Promise<DbUserPreferences | null> {
  return run<DbUserPreferences>(() =>
    (supabase.from('user_preferences') as ReturnType<typeof supabase.from>)
      .upsert({ session_id: sid(), ...prefs, updated_at: new Date().toISOString() } as never)
      .select()
      .single()
  )
}

// ── PORTFOLIOS ────────────────────────────────────────────────────────────────

export async function listPortfolios(): Promise<DbPortfolioSummary[] | null> {
  return run<DbPortfolioSummary[]>(() =>
    supabase.from('portfolio_summary').select('*').eq('session_id', sid()).order('created_at')
  )
}

export async function getPortfolio(id: string): Promise<DbPortfolioSummary | null> {
  return run<DbPortfolioSummary>(() =>
    supabase.from('portfolio_summary').select('*').eq('id', id).single()
  )
}

export async function createPortfolio(
  name: string,
  assets: Asset[],
  settings: PortfolioSettings,
  isDefault = false
): Promise<DbPortfolio | null> {
  const payload: DbPortfolioInsert = {
    session_id:     sid(),
    name,
    description:    null,
    benchmark:      settings.benchmark,
    rebalance:      settings.rebalance,
    initial_amount: settings.initialAmount,
    start_year:     settings.startYear,
    end_year:       settings.endYear,
    risk_free_rate: settings.riskFreeRate,
    is_default:     isDefault,
  }

  const portfolio = await run<DbPortfolio>(() =>
    (supabase.from('portfolios') as ReturnType<typeof supabase.from>)
      .insert(payload as never)
      .select()
      .single()
  )
  if (!portfolio) return null

  const assetRows = assets.map((a, i) => ({
    portfolio_id:  portfolio.id,
    symbol:        a.symbol,
    weight:        a.weight,
    asset_class:   null,
    display_order: i,
  }))

  await run(() =>
    (supabase.from('portfolio_assets') as ReturnType<typeof supabase.from>)
      .insert(assetRows as never)
      .select()
  )

  return portfolio
}

export async function updatePortfolioMeta(
  id: string,
  patch: Partial<Pick<DbPortfolio,
    'name' | 'description' | 'benchmark' | 'rebalance' |
    'initial_amount' | 'start_year' | 'end_year' | 'risk_free_rate' | 'is_default'>>
): Promise<DbPortfolio | null> {
  return run<DbPortfolio>(() =>
    (supabase.from('portfolios') as ReturnType<typeof supabase.from>)
      .update(patch as never)
      .eq('id', id)
      .select()
      .single()
  )
}

export async function deletePortfolio(id: string): Promise<boolean> {
  const result = await run(() =>
    supabase.from('portfolios').delete().eq('id', id).select()
  )
  return result !== null
}

export async function replacePortfolioAssets(
  portfolioId: string,
  assets: Asset[]
): Promise<DbPortfolioAsset[] | null> {
  await run(() =>
    supabase.from('portfolio_assets').delete().eq('portfolio_id', portfolioId).select()
  )
  const rows = assets.map((a, i) => ({
    portfolio_id:  portfolioId,
    symbol:        a.symbol,
    weight:        a.weight,
    asset_class:   null,
    display_order: i,
  }))
  return run<DbPortfolioAsset[]>(() =>
    (supabase.from('portfolio_assets') as ReturnType<typeof supabase.from>)
      .insert(rows as never)
      .select()
  )
}

// ── PORTFOLIO SNAPSHOTS ───────────────────────────────────────────────────────

export async function saveSnapshot(
  portfolioId: string,
  totalValue: number,
  metrics?: { cagr?: number; sharpe?: number; maxDrawdown?: number }
): Promise<DbPortfolioSnapshot | null> {
  const today = new Date().toISOString().slice(0, 10)
  return run<DbPortfolioSnapshot>(() =>
    (supabase.from('portfolio_snapshots') as ReturnType<typeof supabase.from>)
      .upsert({
        portfolio_id:  portfolioId,
        snapshot_date: today,
        total_value:   totalValue,
        daily_pnl:     0,
        daily_pnl_pct: 0,
        cagr:          metrics?.cagr ?? null,
        sharpe:        metrics?.sharpe ?? null,
        max_drawdown:  metrics?.maxDrawdown ?? null,
      } as never)
      .select()
      .single()
  )
}

export async function getSnapshots(
  portfolioId: string,
  limit = 365
): Promise<DbPortfolioSnapshot[] | null> {
  return run<DbPortfolioSnapshot[]>(() =>
    supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('snapshot_date', { ascending: false })
      .limit(limit)
  )
}

// ── WATCHLIST ─────────────────────────────────────────────────────────────────

export async function getWatchlist(): Promise<DbWatchlistItem[] | null> {
  return run<DbWatchlistItem[]>(() =>
    supabase
      .from('watchlist_items')
      .select('*')
      .eq('session_id', sid())
      .order('added_at', { ascending: false })
  )
}

export async function addToWatchlist(symbol: string, note?: string): Promise<DbWatchlistItem | null> {
  return run<DbWatchlistItem>(() =>
    (supabase.from('watchlist_items') as ReturnType<typeof supabase.from>)
      .upsert({ session_id: sid(), symbol: symbol.toUpperCase(), note: note ?? null } as never)
      .select()
      .single()
  )
}

export async function removeFromWatchlist(symbol: string): Promise<boolean> {
  const result = await run(() =>
    supabase
      .from('watchlist_items')
      .delete()
      .eq('session_id', sid())
      .eq('symbol', symbol.toUpperCase())
      .select()
  )
  return result !== null
}

export async function syncWatchlist(symbols: string[]): Promise<boolean> {
  await run(() =>
    supabase.from('watchlist_items').delete().eq('session_id', sid()).select()
  )
  if (symbols.length === 0) return true
  const rows = symbols.map(s => ({ session_id: sid(), symbol: s.toUpperCase(), note: null }))
  const result = await run(() =>
    (supabase.from('watchlist_items') as ReturnType<typeof supabase.from>)
      .insert(rows as never)
      .select()
  )
  return result !== null
}

// ── PRICE ALERTS ──────────────────────────────────────────────────────────────

export async function getAlerts(activeOnly = false): Promise<DbPriceAlert[] | null> {
  let query = supabase
    .from('price_alerts')
    .select('*')
    .eq('session_id', sid())
    .order('created_at', { ascending: false })
  if (activeOnly) query = query.eq('is_active', true)
  return run<DbPriceAlert[]>(() => query)
}

export async function createAlert(
  ticker: string,
  alertType: DbPriceAlert['alert_type'],
  targetValue: number,
  currentRef?: number,
  notes?: string
): Promise<DbPriceAlert | null> {
  return run<DbPriceAlert>(() =>
    (supabase.from('price_alerts') as ReturnType<typeof supabase.from>)
      .insert({
        session_id:   sid(),
        ticker:       ticker.toUpperCase(),
        alert_type:   alertType,
        target_value: targetValue,
        current_ref:  currentRef ?? null,
        is_active:    true,
        notes:        notes ?? null,
      } as never)
      .select()
      .single()
  )
}

export async function updateAlert(
  id: string,
  patch: Partial<Pick<DbPriceAlert, 'is_active' | 'triggered_at' | 'notes' | 'target_value'>>
): Promise<DbPriceAlert | null> {
  return run<DbPriceAlert>(() =>
    (supabase.from('price_alerts') as ReturnType<typeof supabase.from>)
      .update(patch as never)
      .eq('id', id)
      .select()
      .single()
  )
}

export async function deleteAlert(id: string): Promise<boolean> {
  const result = await run(() =>
    supabase.from('price_alerts').delete().eq('id', id).select()
  )
  return result !== null
}

export async function triggerAlert(id: string): Promise<DbPriceAlert | null> {
  return updateAlert(id, { is_active: false, triggered_at: new Date().toISOString() })
}

// ── STOCK NOTES ───────────────────────────────────────────────────────────────

export async function getStockNote(ticker: string): Promise<DbStockNote | null> {
  return run<DbStockNote>(() =>
    supabase
      .from('stock_notes')
      .select('*')
      .eq('session_id', sid())
      .eq('ticker', ticker.toUpperCase())
      .single()
  )
}

export async function upsertStockNote(
  ticker: string,
  note: string,
  sentiment?: DbStockNote['sentiment']
): Promise<DbStockNote | null> {
  return run<DbStockNote>(() =>
    (supabase.from('stock_notes') as ReturnType<typeof supabase.from>)
      .upsert({
        session_id: sid(),
        ticker:     ticker.toUpperCase(),
        note,
        sentiment:  sentiment ?? null,
      } as never)
      .select()
      .single()
  )
}

export async function deleteStockNote(ticker: string): Promise<boolean> {
  const result = await run(() =>
    supabase
      .from('stock_notes')
      .delete()
      .eq('session_id', sid())
      .eq('ticker', ticker.toUpperCase())
      .select()
  )
  return result !== null
}

// ── SCREENER PRESETS ──────────────────────────────────────────────────────────

export async function getScreenerPresets(): Promise<DbScreenerPreset[] | null> {
  return run<DbScreenerPreset[]>(() =>
    supabase
      .from('screener_presets')
      .select('*')
      .eq('session_id', sid())
      .order('created_at')
  )
}

export async function saveScreenerPreset(
  name: string,
  filters: Record<string, unknown>,
  isDefault = false
): Promise<DbScreenerPreset | null> {
  return run<DbScreenerPreset>(() =>
    (supabase.from('screener_presets') as ReturnType<typeof supabase.from>)
      .insert({ session_id: sid(), name, filters, is_default: isDefault } as never)
      .select()
      .single()
  )
}

export async function deleteScreenerPreset(id: string): Promise<boolean> {
  const result = await run(() =>
    supabase.from('screener_presets').delete().eq('id', id).select()
  )
  return result !== null
}

// ── COMPARE PORTFOLIOS ────────────────────────────────────────────────────────

export async function getComparePortfolios(): Promise<DbComparePortfolio[] | null> {
  return run<DbComparePortfolio[]>(() =>
    supabase
      .from('compare_portfolios')
      .select('*')
      .eq('session_id', sid())
      .order('created_at')
  )
}

export async function saveComparePortfolio(
  name: string,
  assets: Asset[]
): Promise<DbComparePortfolio | null> {
  return run<DbComparePortfolio>(() =>
    (supabase.from('compare_portfolios') as ReturnType<typeof supabase.from>)
      .insert({ session_id: sid(), name, assets_json: assets } as never)
      .select()
      .single()
  )
}

export async function deleteComparePortfolio(id: string): Promise<boolean> {
  const result = await run(() =>
    supabase.from('compare_portfolios').delete().eq('id', id).select()
  )
  return result !== null
}
