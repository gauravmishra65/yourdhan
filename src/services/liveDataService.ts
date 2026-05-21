// ============================================================
// YourDhan – Live Data Service
// Stocks/ETFs → Yahoo Finance via Supabase Edge Function proxy
// Mutual Funds → api.mfapi.in (public, CORS-enabled)
// Results cached in localStorage for 5 minutes.
// ============================================================
import { supabase } from '../lib/supabase'

// ── Types ────────────────────────────────────────────────────────────────────

export interface LiveQuote {
  symbol:    string
  price:     number     // ₹ CMP / NAV
  chgPct:    number     // % change from prev close
  chgAbs:    number     // ₹ change
  open:      number
  high:      number
  low:       number
  volume:    number
  w52High:   number
  w52Low:    number
  pe:        number | null
  eps:       number | null
  divYield:  number | null   // %
  marketCap: number          // ₹ crore
  updatedAt: number          // unix ms
}

// ── Cache ────────────────────────────────────────────────────────────────────

const CACHE_KEY = 'yd-live-prices-v2'
const CACHE_TTL = 5 * 60 * 1000  // 5 min

interface Cache { quotes: Record<string, LiveQuote>; ts: number }

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const c: Cache = JSON.parse(raw)
    if (Date.now() - c.ts > CACHE_TTL) return null
    return c
  } catch { return null }
}

function writeCache(quotes: Record<string, LiveQuote>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ quotes, ts: Date.now() })) } catch { /* ignore quota */ }
}

export function clearPriceCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch { /* noop */ }
}

// ── Yahoo Finance symbol mapping ─────────────────────────────────────────────
// Most NSE stocks: symbol + ".NS"   BSE-only: symbol + ".BO"
// Special cases where NSE symbol differs from our internal symbol:

const SPECIAL_YAHOO: Record<string, string> = {
  'MM':         'M%26M.NS',       // M&M
  'BAJAJAUTO':  'BAJAJ-AUTO.NS',
  'MCDOWELL':   'MCDOWELL-N.NS',
  'TVSMOTORS':  'TVSMOTOR.NS',
  'AAPL':       'AFFLE.NS',       // our universe wrongly uses AAPL for Affle
  'SHREECHEM':  'SHREECEM.NS',    // Shree Cement – NSE symbol is SHREECEM
  'VIJAYABANK': 'KTKBANK.NS',     // Karnataka Bank
  'JSWENERGY':  'JSWENERGY.NS',
  'TATACOMS':   'TATACOMM.NS',
  'GUJGASLTD':  'GUJGASLTD.NS',
  'JKPAPERTM':  'JKPAPER.NS',
  'HCLINFO':    'HCLTECH.NS',
  // ETFs on NSE
  'NIFTYBEES':  'NIFTYBEES.NS',
  'JUNIORBEES': 'JUNIORBEES.NS',
  'BANKBEES':   'BANKBEES.NS',
  'GOLDBEES':   'GOLDBEES.NS',
  'LIQUIDBEES': 'LIQUIDBEES.NS',
  'MON100':     'MON100.NS',
  'CPSEETF':    'CPSEETF.NS',
}

function toYahooSymbol(ydSym: string, exchange: string): string | null {
  if (SPECIAL_YAHOO[ydSym]) return SPECIAL_YAHOO[ydSym]
  if (exchange === 'NSE' || exchange === 'NSE/BSE') return `${ydSym}.NS`
  if (exchange === 'BSE') return `${ydSym}.BO`
  return null
}

// ── AMFI code map for mutual funds ───────────────────────────────────────────
// Source: https://api.mfapi.in  (search by scheme name to verify codes)

export const AMFI_CODES: Record<string, number> = {
  // Large Cap
  'HDLC001':  119598,  // HDFC Top 100 Fund - Direct Growth
  'MFLC001':  118834,  // Mirae Asset Large Cap Fund - Direct Growth
  'AXLC001':  120503,  // Axis Bluechip Fund - Direct Growth
  'SBLC001':  119597,  // SBI Bluechip Fund - Direct Growth
  'ICLC001':  120586,  // ICICI Pru Bluechip Fund - Direct Growth
  'NILC001':  118777,  // Nippon India Large Cap Fund - Direct Growth
  'KOLC001':  120255,  // Kotak Bluechip Fund - Direct Growth
  'UFLC001':  120716,  // UTI Nifty 50 Index Fund - Direct Growth (repurposed)
  // Flexi Cap
  'PPFC001':  122639,  // Parag Parikh Flexi Cap Fund - Direct Growth
  'HDFC001':  119592,  // HDFC Flexi Cap Fund - Direct Growth
  'UTFC001':  120716,  // UTI Flexi Cap Fund - Direct Growth
  'AXFC001':  120621,  // Axis Flexi Cap Fund - Direct Growth
  'QUFC001':  135782,  // Quant Flexi Cap Fund - Direct Growth
  'WHYCAP01': 148478,  // WhiteOak Capital Flexi Cap Fund - Direct Growth
  // Mid Cap
  'MIMC001':  119061,  // Mirae Asset Midcap Fund - Direct Growth
  'HDMC001':  119027,  // HDFC Mid-Cap Opportunities Fund - Direct Growth
  'NIMC001':  118808,  // Nippon India Growth Fund (Mid Cap) - Direct Growth
  'AXMC001':  120551,  // Axis Midcap Fund - Direct Growth
  'KOMC001':  120187,  // Kotak Emerging Equity Fund - Direct Growth
  'SBMC001':  119267,  // SBI Magnum Midcap Fund - Direct Growth
  // Small Cap
  'NISC001':  118825,  // Nippon India Small Cap Fund - Direct Growth
  'SBSC001':  119250,  // SBI Small Cap Fund - Direct Growth
  'AXSC001':  120253,  // Axis Small Cap Fund - Direct Growth
  'HDSC001':  119047,  // HDFC Small Cap Fund - Direct Growth
  'QUSC001':  135784,  // Quant Small Cap Fund - Direct Growth
  'ICSC001':  120587,  // ICICI Pru Smallcap Fund - Direct Growth
  // ELSS
  'AXEL001':  120503,  // Axis Long Term Equity Fund - Direct Growth (same code as Bluechip - verify)
  'MIEL001':  120847,  // Mirae Asset Tax Saver Fund - Direct Growth
  'NIEL001':  118817,  // Nippon India Tax Saver ELSS - Direct Growth
  'SBEL001':  119243,  // SBI Long Term Equity Fund ELSS - Direct Growth
  'QUEL001':  135785,  // Quant ELSS Tax Saver Fund - Direct Growth
  // Index
  'UTNF001':  120716,  // UTI Nifty 50 Index Fund Direct Growth
  'HDNF001':  119096,  // HDFC Index Fund Nifty 50 Direct Growth
  'SBNF001':  119267,  // SBI Nifty Index Fund Direct Growth
  'MONF001':  130503,  // Motilal Oswal Nifty 50 Index Fund Direct Growth
  'MINN001':  119061,  // Mirae Asset Nifty Next 50
  'NANQ001':  118831,  // Nippon India Nasdaq 100 FoF Direct Growth
  'MONQ001':  130500,  // Motilal Oswal Nasdaq 100 FoF Direct Growth
  // Hybrid
  'PPBF001':  120586,  // ICICI Pru Balanced Advantage - Direct Growth
  'HDBF001':  119571,  // HDFC Balanced Advantage Fund - Direct Growth
  'KOBF001':  120255,  // Kotak Balanced Advantage - Direct Growth
  'SBBF001':  119237,  // SBI Equity Hybrid Fund - Direct Growth
  // Debt / Liquid
  'HDLQ001':  119563,  // HDFC Liquid Fund Direct Growth
  'ICITDT01': 120606,  // ICICI Pru Liquid Fund Direct Growth
  // Sectoral
  'SBHCS01':  119253,  // SBI Healthcare Opportunities Fund - Direct Growth
  'NIPHC01':  118819,  // Nippon India Pharma Fund - Direct Growth
  'QUACT01':  135781,  // Quant Active Fund - Direct Growth
  // New MFs (added in expanded universe)
  'TATEC001': 119607,  // Tata Digital India Fund - Direct Growth
  'ICBF001':  120605,  // ICICI Pru Banking & Financial Services - Direct Growth
  'MIIF001':  118837,  // Mirae Asset Hybrid Equity Fund - Direct Growth
  'HDDI001':  119029,  // HDFC Dividend Yield Fund - Direct Growth
  'FRANKFI01':104917,  // Franklin India Flexi Cap Fund - Direct Growth
  'FRANKLIN01':104917, // Franklin India Flexi Cap
  'DSPMC001': 120175,  // DSP Midcap Fund - Direct Growth
  'PGIMFL01': 125497,  // PGIM India Flexi Cap Fund - Direct Growth
  'INVESCFL01':120816, // Invesco India Flexi Cap Fund - Direct Growth
  'ABSLFL01': 119561,  // Aditya Birla SL Flexi Cap Fund - Direct Growth
  'ABSLMC01': 119556,  // Aditya Birla SL Midcap Fund - Direct Growth
  'ABSLSC01': 119558,  // Aditya Birla SL Small Cap Fund - Direct Growth
  'KOTAKBAF01':120193, // Kotak Balanced Advantage Fund
  'TATAT100': 119607,  // Tata Large Cap Fund Direct Growth
  'NIPBF001': 118808,  // Nippon India Balanced Advantage Fund
  'HSBC001':  130503,  // HSBC Flexi Cap Fund Direct Growth
}

// ── Fetch stock quotes via Supabase Edge Function ────────────────────────────

const BATCH = 50

async function fetchStockBatch(
  items: { yd: string; yahoo: string }[]
): Promise<Record<string, LiveQuote>> {
  const result: Record<string, LiveQuote> = {}
  try {
    const { data, error } = await supabase.functions.invoke<{
      quoteResponse?: { result?: unknown[] }
    }>('fetch-prices', {
      body: { symbols: items.map(i => i.yahoo) },
    })
    if (error || !data?.quoteResponse?.result) return result

    for (const q of data.quoteResponse.result as Record<string, unknown>[]) {
      const yahooSym = q.symbol as string
      const mapping  = items.find(i => i.yahoo === yahooSym)
      if (!mapping) continue

      result[mapping.yd] = {
        symbol:    mapping.yd,
        price:     (q.regularMarketPrice as number) ?? 0,
        chgPct:    Math.round(((q.regularMarketChangePercent as number) ?? 0) * 100) / 100,
        chgAbs:    Math.round(((q.regularMarketChange as number) ?? 0) * 100) / 100,
        open:      (q.regularMarketOpen as number) ?? 0,
        high:      (q.regularMarketDayHigh as number) ?? 0,
        low:       (q.regularMarketDayLow as number) ?? 0,
        volume:    (q.regularMarketVolume as number) ?? 0,
        w52High:   (q.fiftyTwoWeekHigh as number) ?? 0,
        w52Low:    (q.fiftyTwoWeekLow as number) ?? 0,
        pe:        (q.trailingPE as number | undefined) ?? null,
        eps:       (q.epsTrailingTwelveMonths as number | undefined) ?? null,
        divYield:  (q.trailingAnnualDividendYield as number)
                     ? Math.round(((q.trailingAnnualDividendYield as number) * 100) * 100) / 100
                     : null,
        marketCap: Math.round(((q.marketCap as number) ?? 0) / 1e7), // → ₹ crore
        updatedAt: Date.now(),
      }
    }
  } catch (e) {
    console.warn('[LiveData] Stock fetch failed:', e)
  }
  return result
}

async function fetchAllStocks(
  items: { symbol: string; exchange: string }[]
): Promise<Record<string, LiveQuote>> {
  const mapped = items
    .map(i => ({ yd: i.symbol, yahoo: toYahooSymbol(i.symbol, i.exchange) }))
    .filter((x): x is { yd: string; yahoo: string } => x.yahoo !== null)

  const result: Record<string, LiveQuote> = {}
  for (let i = 0; i < mapped.length; i += BATCH) {
    const batch  = mapped.slice(i, i + BATCH)
    const quotes = await fetchStockBatch(batch)
    Object.assign(result, quotes)
  }
  return result
}

// ── Fetch MF NAVs via mfapi.in ────────────────────────────────────────────────

async function fetchMFNavs(
  mfSymbols: string[]
): Promise<Record<string, LiveQuote>> {
  const result: Record<string, LiveQuote> = {}
  const toFetch = mfSymbols.filter(s => AMFI_CODES[s])

  await Promise.allSettled(
    toFetch.map(async sym => {
      const code = AMFI_CODES[sym]
      try {
        const resp = await fetch(`https://api.mfapi.in/mf/${code}`, {
          signal: AbortSignal.timeout(8000),
        })
        if (!resp.ok) return
        const json = await resp.json() as { data?: { date: string; nav: string }[] }
        const latest = json.data?.[0]
        const prev   = json.data?.[1]
        if (!latest?.nav) return

        const price  = parseFloat(latest.nav)
        const prev0  = prev ? parseFloat(prev.nav) : price
        const chgAbs = price - prev0
        const chgPct = prev0 > 0 ? (chgAbs / prev0) * 100 : 0

        result[sym] = {
          symbol:    sym,
          price:     Math.round(price * 100) / 100,
          chgPct:    Math.round(chgPct * 10000) / 10000,
          chgAbs:    Math.round(chgAbs * 10000) / 10000,
          open:      price, high: price, low: price,
          volume:    0,
          w52High:   0,
          w52Low:    0,
          pe:        null, eps: null, divYield: null,
          marketCap: 0,
          updatedAt: Date.now(),
        }
      } catch { /* skip this fund */ }
    })
  )
  return result
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface FetchTarget {
  symbol:   string
  exchange: string
  type:     string  // 'Stock' | 'ETF' | 'MF'
}

/** Fetch live prices for a set of instruments.
 *  Reads from cache first; only goes to network if cache is stale.
 *  Set forceRefresh=true to bypass the cache. */
export async function fetchLivePrices(
  items:        FetchTarget[],
  forceRefresh  = false,
): Promise<Record<string, LiveQuote>> {
  if (!forceRefresh) {
    const cached = readCache()
    if (cached) return cached.quotes
  }

  const stocks = items.filter(i => i.type !== 'MF')
  const mfs    = items.filter(i => i.type === 'MF')

  const [stockQuotes, mfNavs] = await Promise.all([
    fetchAllStocks(stocks),
    fetchMFNavs(mfs.map(m => m.symbol)),
  ])

  const all = { ...stockQuotes, ...mfNavs }
  if (Object.keys(all).length > 0) writeCache(all)
  return all
}

/** Returns true if we have fresh (< 5 min) cached prices */
export function hasFreshCache(): boolean {
  return readCache() !== null
}

/** How many minutes since last price refresh (null if never fetched) */
export function minutesSinceRefresh(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const c: Cache = JSON.parse(raw)
    return Math.floor((Date.now() - c.ts) / 60000)
  } catch { return null }
}
