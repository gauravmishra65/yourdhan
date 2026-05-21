// ============================================================
// YourDhan – Supabase Edge Function: fetch-prices
// Proxies Yahoo Finance quote requests server-side (no CORS issues).
// Deploy: supabase functions deploy fetch-prices
// ============================================================
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const JSON_HEADERS = { ...CORS, 'Content-Type': 'application/json' }

// Yahoo Finance fields we care about
const YF_FIELDS = [
  'regularMarketPrice',
  'regularMarketChangePercent',
  'regularMarketChange',
  'regularMarketVolume',
  'regularMarketOpen',
  'regularMarketDayHigh',
  'regularMarketDayLow',
  'fiftyTwoWeekHigh',
  'fiftyTwoWeekLow',
  'marketCap',
  'trailingPE',
  'epsTrailingTwelveMonths',
  'trailingAnnualDividendYield',
  'shortName',
  'longName',
].join(',')

serve(async (req: Request) => {
  // ── CORS preflight ────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const symbols: string[] = Array.isArray(body?.symbols) ? body.symbols : []

    if (symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'symbols array is required' }),
        { status: 400, headers: JSON_HEADERS }
      )
    }

    const batch = symbols.slice(0, 50).join(',')
    const url   = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${batch}&fields=${YF_FIELDS}`

    const yf = await fetch(url, {
      headers: {
        'User-Agent':  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':      'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':     'https://finance.yahoo.com/',
      },
    })

    if (!yf.ok) {
      // Try query2 as fallback
      const yf2 = await fetch(url.replace('query1', 'query2'), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })
      if (!yf2.ok) {
        return new Response(
          JSON.stringify({ error: `Yahoo Finance returned ${yf.status}` }),
          { status: 502, headers: JSON_HEADERS }
        )
      }
      const data = await yf2.json()
      return new Response(JSON.stringify(data), { headers: JSON_HEADERS })
    }

    const data = await yf.json()
    return new Response(JSON.stringify(data), { headers: JSON_HEADERS })

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: JSON_HEADERS }
    )
  }
})
