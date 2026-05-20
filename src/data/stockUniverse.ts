// ============================================================
// YourDhan – Comprehensive Stock Universe
// NSE (300+) + BSE (80+) + Mutual Funds (80+) + ETFs (30)
// Prices are approximate mock values for demo purposes.
// ============================================================

export type InstrumentType = 'Stock' | 'ETF' | 'MF'
export type Exchange = 'NSE' | 'BSE' | 'NSE/BSE'
export type MarketCap = 'Large' | 'Mid' | 'Small' | 'N/A'

export interface UniverseItem {
  symbol:   string
  name:     string
  exchange: Exchange
  sector:   string
  price:    number        // approximate CMP / NAV (₹)
  chg:      number        // 1-day change %
  type:     InstrumentType
  cap:      MarketCap
  // ── Fundamental / 52-week data ───────────────────────────
  w52High:  number        // 52-week high (₹)
  w52Low:   number        // 52-week low  (₹)
  pe:       number | null // Price / Earnings ratio  (null for ETF/MF)
  eps:      number | null // Earnings per share ₹     (null for ETF/MF)
  divYield: number | null // Dividend yield %          (null if no dividend)
  divPaid:  number | null // Dividend paid per share ₹ (null if no dividend)
}

// ── Seeded hash (deterministic pseudo-random) ────────────────────────────────
function hsh(sym: string, seed: number): number {
  let h = seed * 2654435761
  for (const c of sym) h = (Math.imul(h ^ c.charCodeAt(0), 2654435761)) >>> 0
  return h / 0xffffffff          // [0, 1)
}

// ── 1-day change helper ──────────────────────────────────────────────────────
function chg(sym: string): number {
  let h = 0
  for (const c of sym) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff
  const v = ((h % 1000) / 1000) * 4 - 2  // -2% to +2%
  return Math.round(v * 100) / 100
}

// ── Sector → P/E range table ─────────────────────────────────────────────────
const PE_RANGE: Record<string, [number, number]> = {
  'Energy':          [ 6,  14],
  'IT':              [22,  42],
  'FMCG':            [35,  65],
  'Pharma':          [18,  38],
  'Auto':            [14,  28],
  'Financials':      [ 8,  22],
  'Materials':       [ 8,  18],
  'Metals':          [ 6,  16],
  'Real Estate':     [20,  48],
  'Consumer':        [28,  58],
  'Consumer Tech':   [60, 180],
  'Fintech':         [40, 130],
  'Telecom':         [18,  40],
  'Capital Goods':   [28,  58],
  'Infrastructure':  [14,  32],
  'Utilities':       [12,  22],
  'Healthcare':      [32,  68],
  'Hospitality':     [22,  58],
  'Logistics':       [18,  40],
  'Defence':         [18,  40],
  'Insurance':       [22,  50],
  'Chemicals':       [18,  44],
  'Industrials':     [18,  44],
  'Textiles':        [ 8,  20],
  'Retail':          [38,  88],
  'Diversified':     [12,  30],
}

// ── Sector → base dividend-yield range (%) ───────────────────────────────────
const DIV_RANGE: Record<string, [number, number] | null> = {
  'Energy':         [2.5, 6.5],
  'Metals':         [1.5, 5.0],
  'Materials':      [1.0, 4.0],
  'Utilities':      [1.5, 5.0],
  'FMCG':           [1.0, 4.5],
  'Financials':     [0.5, 2.5],
  'IT':             [0.5, 2.5],
  'Auto':           [0.5, 2.0],
  'Pharma':         [0.3, 1.5],
  'Telecom':        [0.5, 2.0],
  'Capital Goods':  [0.3, 1.5],
  'Infrastructure': [0.5, 2.0],
  'Defence':        [0.5, 2.0],
  'Insurance':      [0.3, 1.0],
  'Chemicals':      [0.3, 1.5],
  'Industrials':    [0.3, 1.5],
  'Textiles':       [0.5, 2.0],
  'Hospitality':    [0.0, 0.5],
  'Logistics':      [0.0, 0.8],
  'Consumer':       [0.2, 1.2],
  // Growth / no-div sectors — return null to mark as no dividend
  'Real Estate':    null,
  'Consumer Tech':  null,
  'Fintech':        null,
  'Retail':         null,
  'Healthcare':     [0.0, 0.5],
  'Diversified':    [0.5, 2.0],
}

// ── Fundamental data generator ───────────────────────────────────────────────
// Generates 52W range, P/E, EPS, Div Yield, Div Paid deterministically
// from the symbol+price+type+sector so values are stable across renders.
function mkFund(
  sym: string, price: number, type: InstrumentType, sector: string
): Pick<UniverseItem, 'w52High' | 'w52Low' | 'pe' | 'eps' | 'divYield' | 'divPaid'> {

  // 52-week high: 5–45% above price
  const hiPct = 0.05 + hsh(sym, 1) * 0.40
  // 52-week low:  5–50% below price
  const loPct = 0.05 + hsh(sym, 2) * 0.45
  const w52High = Math.round(price * (1 + hiPct) * 100) / 100
  const w52Low  = Math.round(price * (1 - loPct) * 100) / 100

  // ETFs and MFs — no P/E, EPS, dividends (tracked as yield, not declared)
  if (type === 'ETF' || type === 'MF') {
    return { w52High, w52Low, pe: null, eps: null, divYield: null, divPaid: null }
  }

  // P/E
  const [peMin, peMax] = PE_RANGE[sector] ?? [12, 30]
  const pe = Math.round((peMin + hsh(sym, 3) * (peMax - peMin)) * 10) / 10

  // EPS = Price / P/E
  const eps = Math.round((price / pe) * 100) / 100

  // Dividend yield
  const divRange = sector in DIV_RANGE ? DIV_RANGE[sector] : [0.3, 1.5]
  let divYield: number | null = null
  let divPaid:  number | null = null

  if (divRange !== null) {
    // ~25% chance of zero div even within a paying sector (young/growth names)
    const skipDiv = hsh(sym, 6) < 0.25 && ['Consumer Tech','Fintech','Real Estate','Retail'].includes(sector)
    if (!skipDiv) {
      const [dyMin, dyMax] = divRange
      const raw = dyMin + hsh(sym, 4) * (dyMax - dyMin)
      divYield = Math.round(raw * 100) / 100
      // Dividend paid = CMP × yield / 100, rounded to nearest ₹0.25
      const amt = price * divYield / 100
      divPaid = Math.round(amt * 4) / 4   // nearest 0.25
    }
  }

  return { w52High, w52Low, pe, eps, divYield, divPaid }
}

// ============================================================
// NSE NIFTY 50
// ============================================================
const NIFTY50: UniverseItem[] = [
  { symbol:'RELIANCE',   name:'Reliance Industries Ltd',           exchange:'NSE', sector:'Energy',      price:2847,  chg:chg('RELIANCE'),   type:'Stock', cap:'Large' },
  { symbol:'TCS',        name:'Tata Consultancy Services Ltd',     exchange:'NSE', sector:'IT',          price:3892,  chg:chg('TCS'),        type:'Stock', cap:'Large' },
  { symbol:'HDFCBANK',   name:'HDFC Bank Ltd',                     exchange:'NSE', sector:'Financials',  price:1623,  chg:chg('HDFCBANK'),   type:'Stock', cap:'Large' },
  { symbol:'INFY',       name:'Infosys Ltd',                       exchange:'NSE', sector:'IT',          price:1645,  chg:chg('INFY'),       type:'Stock', cap:'Large' },
  { symbol:'ICICIBANK',  name:'ICICI Bank Ltd',                    exchange:'NSE', sector:'Financials',  price:1245,  chg:chg('ICICIBANK'),  type:'Stock', cap:'Large' },
  { symbol:'HINDUNILVR', name:'Hindustan Unilever Ltd',            exchange:'NSE', sector:'FMCG',        price:2380,  chg:chg('HINDUNILVR'), type:'Stock', cap:'Large' },
  { symbol:'KOTAKBANK',  name:'Kotak Mahindra Bank Ltd',           exchange:'NSE', sector:'Financials',  price:1920,  chg:chg('KOTAKBANK'),  type:'Stock', cap:'Large' },
  { symbol:'LT',         name:'Larsen & Toubro Ltd',               exchange:'NSE', sector:'Capital Goods',price:3540, chg:chg('LT'),         type:'Stock', cap:'Large' },
  { symbol:'SBIN',       name:'State Bank of India',               exchange:'NSE', sector:'Financials',  price:815,   chg:chg('SBIN'),       type:'Stock', cap:'Large' },
  { symbol:'BHARTIARTL', name:'Bharti Airtel Ltd',                 exchange:'NSE', sector:'Telecom',     price:1842,  chg:chg('BHARTIARTL'), type:'Stock', cap:'Large' },
  { symbol:'ASIANPAINT', name:'Asian Paints Ltd',                  exchange:'NSE', sector:'FMCG',        price:2712,  chg:chg('ASIANPAINT'), type:'Stock', cap:'Large' },
  { symbol:'BAJFINANCE', name:'Bajaj Finance Ltd',                 exchange:'NSE', sector:'Financials',  price:7140,  chg:chg('BAJFINANCE'), type:'Stock', cap:'Large' },
  { symbol:'HCLTECH',    name:'HCL Technologies Ltd',              exchange:'NSE', sector:'IT',          price:1758,  chg:chg('HCLTECH'),    type:'Stock', cap:'Large' },
  { symbol:'MARUTI',     name:'Maruti Suzuki India Ltd',           exchange:'NSE', sector:'Auto',        price:12350, chg:chg('MARUTI'),     type:'Stock', cap:'Large' },
  { symbol:'AXISBANK',   name:'Axis Bank Ltd',                     exchange:'NSE', sector:'Financials',  price:1189,  chg:chg('AXISBANK'),   type:'Stock', cap:'Large' },
  { symbol:'SUNPHARMA',  name:'Sun Pharmaceutical Industries',     exchange:'NSE', sector:'Pharma',      price:1762,  chg:chg('SUNPHARMA'),  type:'Stock', cap:'Large' },
  { symbol:'ONGC',       name:'Oil and Natural Gas Corporation',   exchange:'NSE', sector:'Energy',      price:278,   chg:chg('ONGC'),       type:'Stock', cap:'Large' },
  { symbol:'ULTRACEMCO', name:'UltraTech Cement Ltd',              exchange:'NSE', sector:'Materials',   price:11420, chg:chg('ULTRACEMCO'), type:'Stock', cap:'Large' },
  { symbol:'ITC',        name:'ITC Ltd',                           exchange:'NSE', sector:'FMCG',        price:468,   chg:chg('ITC'),        type:'Stock', cap:'Large' },
  { symbol:'TITAN',      name:'Titan Company Ltd',                 exchange:'NSE', sector:'Consumer',    price:3485,  chg:chg('TITAN'),      type:'Stock', cap:'Large' },
  { symbol:'NTPC',       name:'NTPC Ltd',                          exchange:'NSE', sector:'Utilities',   price:392,   chg:chg('NTPC'),       type:'Stock', cap:'Large' },
  { symbol:'POWERGRID',  name:'Power Grid Corporation of India',   exchange:'NSE', sector:'Utilities',   price:342,   chg:chg('POWERGRID'),  type:'Stock', cap:'Large' },
  { symbol:'WIPRO',      name:'Wipro Ltd',                         exchange:'NSE', sector:'IT',          price:546,   chg:chg('WIPRO'),      type:'Stock', cap:'Large' },
  { symbol:'BAJAJFINSV', name:'Bajaj Finserv Ltd',                 exchange:'NSE', sector:'Financials',  price:1672,  chg:chg('BAJAJFINSV'), type:'Stock', cap:'Large' },
  { symbol:'MM',         name:'Mahindra & Mahindra Ltd',           exchange:'NSE', sector:'Auto',        price:2980,  chg:chg('MM'),         type:'Stock', cap:'Large' },
  { symbol:'ADANIENT',   name:'Adani Enterprises Ltd',             exchange:'NSE', sector:'Diversified', price:2580,  chg:chg('ADANIENT'),   type:'Stock', cap:'Large' },
  { symbol:'ADANIPORTS', name:'Adani Ports & Special Economic Zone',exchange:'NSE',sector:'Infrastructure',price:1362,chg:chg('ADANIPORTS'), type:'Stock', cap:'Large' },
  { symbol:'TECHM',      name:'Tech Mahindra Ltd',                 exchange:'NSE', sector:'IT',          price:1485,  chg:chg('TECHM'),      type:'Stock', cap:'Large' },
  { symbol:'GRASIM',     name:'Grasim Industries Ltd',             exchange:'NSE', sector:'Materials',   price:2745,  chg:chg('GRASIM'),     type:'Stock', cap:'Large' },
  { symbol:'INDUSINDBK', name:'IndusInd Bank Ltd',                 exchange:'NSE', sector:'Financials',  price:978,   chg:chg('INDUSINDBK'), type:'Stock', cap:'Large' },
  { symbol:'JSWSTEEL',   name:'JSW Steel Ltd',                     exchange:'NSE', sector:'Metals',      price:978,   chg:chg('JSWSTEEL'),   type:'Stock', cap:'Large' },
  { symbol:'TATASTEEL',  name:'Tata Steel Ltd',                    exchange:'NSE', sector:'Metals',      price:162,   chg:chg('TATASTEEL'),  type:'Stock', cap:'Large' },
  { symbol:'DRREDDY',    name:'Dr. Reddy\'s Laboratories',         exchange:'NSE', sector:'Pharma',      price:6245,  chg:chg('DRREDDY'),    type:'Stock', cap:'Large' },
  { symbol:'CIPLA',      name:'Cipla Ltd',                         exchange:'NSE', sector:'Pharma',      price:1542,  chg:chg('CIPLA'),      type:'Stock', cap:'Large' },
  { symbol:'COALINDIA',  name:'Coal India Ltd',                    exchange:'NSE', sector:'Metals',      price:480,   chg:chg('COALINDIA'),  type:'Stock', cap:'Large' },
  { symbol:'HINDALCO',   name:'Hindalco Industries Ltd',           exchange:'NSE', sector:'Metals',      price:678,   chg:chg('HINDALCO'),   type:'Stock', cap:'Large' },
  { symbol:'DIVISLAB',   name:'Divi\'s Laboratories Ltd',          exchange:'NSE', sector:'Pharma',      price:4820,  chg:chg('DIVISLAB'),   type:'Stock', cap:'Large' },
  { symbol:'HDFCLIFE',   name:'HDFC Life Insurance Company',       exchange:'NSE', sector:'Insurance',   price:685,   chg:chg('HDFCLIFE'),   type:'Stock', cap:'Large' },
  { symbol:'SBILIFE',    name:'SBI Life Insurance Company',        exchange:'NSE', sector:'Insurance',   price:1578,  chg:chg('SBILIFE'),    type:'Stock', cap:'Large' },
  { symbol:'BPCL',       name:'Bharat Petroleum Corporation',      exchange:'NSE', sector:'Energy',      price:318,   chg:chg('BPCL'),       type:'Stock', cap:'Large' },
  { symbol:'BRITANNIA',  name:'Britannia Industries Ltd',          exchange:'NSE', sector:'FMCG',        price:5240,  chg:chg('BRITANNIA'),  type:'Stock', cap:'Large' },
  { symbol:'TATAMOTORS', name:'Tata Motors Ltd',                   exchange:'NSE', sector:'Auto',        price:948,   chg:chg('TATAMOTORS'), type:'Stock', cap:'Large' },
  { symbol:'APOLLOHOSP', name:'Apollo Hospitals Enterprise',       exchange:'NSE', sector:'Healthcare',  price:6845,  chg:chg('APOLLOHOSP'), type:'Stock', cap:'Large' },
  { symbol:'NESTLEIND',  name:'Nestle India Ltd',                  exchange:'NSE', sector:'FMCG',        price:2312,  chg:chg('NESTLEIND'),  type:'Stock', cap:'Large' },
  { symbol:'HEROMOTOCO', name:'Hero MotoCorp Ltd',                 exchange:'NSE', sector:'Auto',        price:4652,  chg:chg('HEROMOTOCO'), type:'Stock', cap:'Large' },
  { symbol:'BAJAJAUTO',  name:'Bajaj Auto Ltd',                    exchange:'NSE', sector:'Auto',        price:9842,  chg:chg('BAJAJAUTO'),  type:'Stock', cap:'Large' },
  { symbol:'EICHERMOT',  name:'Eicher Motors Ltd',                 exchange:'NSE', sector:'Auto',        price:4985,  chg:chg('EICHERMOT'),  type:'Stock', cap:'Large' },
  { symbol:'TATACONSUM', name:'Tata Consumer Products Ltd',        exchange:'NSE', sector:'FMCG',        price:1095,  chg:chg('TATACONSUM'), type:'Stock', cap:'Large' },
  { symbol:'LTIM',       name:'LTIMindtree Ltd',                   exchange:'NSE', sector:'IT',          price:5420,  chg:chg('LTIM'),       type:'Stock', cap:'Large' },
  { symbol:'UPL',        name:'UPL Ltd',                           exchange:'NSE', sector:'Chemicals',   price:548,   chg:chg('UPL'),        type:'Stock', cap:'Large' },
]

// ============================================================
// NIFTY Next 50 / Mid Cap Leaders
// ============================================================
const NIFTY_NEXT50: UniverseItem[] = [
  { symbol:'DMART',       name:'Avenue Supermarts Ltd (DMart)',     exchange:'NSE', sector:'Retail',      price:4512,  chg:chg('DMART'),      type:'Stock', cap:'Large' },
  { symbol:'DLF',         name:'DLF Ltd',                          exchange:'NSE', sector:'Real Estate',  price:892,   chg:chg('DLF'),        type:'Stock', cap:'Large' },
  { symbol:'SIEMENS',     name:'Siemens Ltd',                      exchange:'NSE', sector:'Capital Goods',price:7245,  chg:chg('SIEMENS'),    type:'Stock', cap:'Large' },
  { symbol:'CHOLAFIN',    name:'Cholamandalam Investment & Finance',exchange:'NSE', sector:'Financials',  price:1512,  chg:chg('CHOLAFIN'),   type:'Stock', cap:'Large' },
  { symbol:'POLYCAB',     name:'Polycab India Ltd',                 exchange:'NSE', sector:'Capital Goods',price:6845, chg:chg('POLYCAB'),    type:'Stock', cap:'Mid'   },
  { symbol:'HAVELLS',     name:'Havells India Ltd',                 exchange:'NSE', sector:'Capital Goods',price:1842, chg:chg('HAVELLS'),    type:'Stock', cap:'Large' },
  { symbol:'BERGEPAINT',  name:'Berger Paints India Ltd',           exchange:'NSE', sector:'FMCG',        price:562,   chg:chg('BERGEPAINT'), type:'Stock', cap:'Large' },
  { symbol:'MUTHOOTFIN',  name:'Muthoot Finance Ltd',               exchange:'NSE', sector:'Financials',  price:1945,  chg:chg('MUTHOOTFIN'), type:'Stock', cap:'Mid'   },
  { symbol:'SHRIRAMFIN',  name:'Shriram Finance Ltd',               exchange:'NSE', sector:'Financials',  price:3145,  chg:chg('SHRIRAMFIN'), type:'Stock', cap:'Large' },
  { symbol:'TRENT',       name:'Trent Ltd',                         exchange:'NSE', sector:'Retail',      price:5845,  chg:chg('TRENT'),      type:'Stock', cap:'Large' },
  { symbol:'NAUKRI',      name:'Info Edge (India) Ltd',             exchange:'NSE', sector:'IT',          price:7245,  chg:chg('NAUKRI'),     type:'Stock', cap:'Large' },
  { symbol:'IRCTC',       name:'Indian Railway Catering & Tourism', exchange:'NSE', sector:'Consumer',    price:868,   chg:chg('IRCTC'),      type:'Stock', cap:'Mid'   },
  { symbol:'SBICARD',     name:'SBI Cards and Payment Services',    exchange:'NSE', sector:'Financials',  price:842,   chg:chg('SBICARD'),    type:'Stock', cap:'Mid'   },
  { symbol:'PIIND',       name:'PI Industries Ltd',                 exchange:'NSE', sector:'Chemicals',   price:4512,  chg:chg('PIIND'),      type:'Stock', cap:'Mid'   },
  { symbol:'TORNTPHARM',  name:'Torrent Pharmaceuticals Ltd',       exchange:'NSE', sector:'Pharma',      price:3245,  chg:chg('TORNTPHARM'), type:'Stock', cap:'Mid'   },
  { symbol:'PERSISTENT',  name:'Persistent Systems Ltd',            exchange:'NSE', sector:'IT',          price:5842,  chg:chg('PERSISTENT'), type:'Stock', cap:'Mid'   },
  { symbol:'MPHASIS',     name:'Mphasis Ltd',                       exchange:'NSE', sector:'IT',          price:3012,  chg:chg('MPHASIS'),    type:'Stock', cap:'Mid'   },
  { symbol:'COFORGE',     name:'Coforge Ltd',                       exchange:'NSE', sector:'IT',          price:8245,  chg:chg('COFORGE'),    type:'Stock', cap:'Mid'   },
  { symbol:'CANBK',       name:'Canara Bank',                       exchange:'NSE', sector:'Financials',  price:102,   chg:chg('CANBK'),      type:'Stock', cap:'Large' },
  { symbol:'BANDHANBNK',  name:'Bandhan Bank Ltd',                  exchange:'NSE', sector:'Financials',  price:178,   chg:chg('BANDHANBNK'), type:'Stock', cap:'Mid'   },
  { symbol:'PFC',         name:'Power Finance Corporation Ltd',     exchange:'NSE', sector:'Financials',  price:478,   chg:chg('PFC'),        type:'Stock', cap:'Large' },
  { symbol:'RECLTD',      name:'REC Ltd',                           exchange:'NSE', sector:'Financials',  price:548,   chg:chg('RECLTD'),     type:'Stock', cap:'Large' },
  { symbol:'SAIL',        name:'Steel Authority of India Ltd',      exchange:'NSE', sector:'Metals',      price:145,   chg:chg('SAIL'),       type:'Stock', cap:'Mid'   },
  { symbol:'VEDL',        name:'Vedanta Ltd',                       exchange:'NSE', sector:'Metals',      price:478,   chg:chg('VEDL'),       type:'Stock', cap:'Large' },
  { symbol:'GODREJCP',    name:'Godrej Consumer Products Ltd',      exchange:'NSE', sector:'FMCG',        price:1342,  chg:chg('GODREJCP'),   type:'Stock', cap:'Large' },
  { symbol:'PETRONET',    name:'Petronet LNG Ltd',                  exchange:'NSE', sector:'Energy',      price:382,   chg:chg('PETRONET'),   type:'Stock', cap:'Mid'   },
  { symbol:'IOC',         name:'Indian Oil Corporation Ltd',        exchange:'NSE', sector:'Energy',      price:145,   chg:chg('IOC'),        type:'Stock', cap:'Large' },
  { symbol:'BEL',         name:'Bharat Electronics Ltd',            exchange:'NSE', sector:'Defence',     price:312,   chg:chg('BEL'),        type:'Stock', cap:'Large' },
  { symbol:'AMBUJACEM',   name:'Ambuja Cements Ltd',                exchange:'NSE', sector:'Materials',   price:678,   chg:chg('AMBUJACEM'),  type:'Stock', cap:'Large' },
  { symbol:'INDHOTEL',    name:'Indian Hotels Company Ltd',         exchange:'NSE', sector:'Hospitality', price:645,   chg:chg('INDHOTEL'),   type:'Stock', cap:'Mid'   },
  { symbol:'TVSMOTORS',   name:'TVS Motor Company Ltd',             exchange:'NSE', sector:'Auto',        price:2345,  chg:chg('TVSMOTORS'),  type:'Stock', cap:'Large' },
  { symbol:'LUPIN',       name:'Lupin Ltd',                         exchange:'NSE', sector:'Pharma',      price:2145,  chg:chg('LUPIN'),      type:'Stock', cap:'Large' },
  { symbol:'OBEROIRLTY',  name:'Oberoi Realty Ltd',                 exchange:'NSE', sector:'Real Estate', price:1942,  chg:chg('OBEROIRLTY'), type:'Stock', cap:'Mid'   },
  { symbol:'INDUSTOWER',  name:'Indus Towers Ltd',                  exchange:'NSE', sector:'Telecom',     price:412,   chg:chg('INDUSTOWER'), type:'Stock', cap:'Large' },
  { symbol:'NHPC',        name:'NHPC Ltd',                          exchange:'NSE', sector:'Utilities',   price:98,    chg:chg('NHPC'),       type:'Stock', cap:'Mid'   },
  { symbol:'NLCINDIA',    name:'NLC India Ltd',                     exchange:'NSE', sector:'Utilities',   price:245,   chg:chg('NLCINDIA'),   type:'Stock', cap:'Mid'   },
  { symbol:'NH',          name:'Narayana Hrudayalaya Ltd',          exchange:'NSE', sector:'Healthcare',  price:1342,  chg:chg('NH'),         type:'Stock', cap:'Mid'   },
  { symbol:'ASTRAL',      name:'Astral Ltd',                        exchange:'NSE', sector:'Materials',   price:2145,  chg:chg('ASTRAL'),     type:'Stock', cap:'Mid'   },
  { symbol:'ABCAPITAL',   name:'Aditya Birla Capital Ltd',          exchange:'NSE', sector:'Financials',  price:215,   chg:chg('ABCAPITAL'),  type:'Stock', cap:'Mid'   },
  { symbol:'MCDOWELL',    name:'United Spirits Ltd',                exchange:'NSE', sector:'Consumer',    price:1245,  chg:chg('MCDOWELL'),   type:'Stock', cap:'Mid'   },
]

// ============================================================
// NIFTY Midcap 100 (selected)
// ============================================================
const MIDCAP: UniverseItem[] = [
  { symbol:'ZOMATO',      name:'Zomato Ltd',                        exchange:'NSE', sector:'Consumer Tech',price:245,  chg:chg('ZOMATO'),     type:'Stock', cap:'Mid'   },
  { symbol:'PAYTM',       name:'One 97 Communications (Paytm)',     exchange:'NSE', sector:'Fintech',     price:545,   chg:chg('PAYTM'),      type:'Stock', cap:'Mid'   },
  { symbol:'NYKAA',       name:'FSN E-Commerce (Nykaa)',            exchange:'NSE', sector:'Retail',      price:178,   chg:chg('NYKAA'),      type:'Stock', cap:'Mid'   },
  { symbol:'POLICYBZR',   name:'PB Fintech (PolicyBazaar)',         exchange:'NSE', sector:'Fintech',     price:1845,  chg:chg('POLICYBZR'),  type:'Stock', cap:'Mid'   },
  { symbol:'DELHIVERY',   name:'Delhivery Ltd',                     exchange:'NSE', sector:'Logistics',   price:398,   chg:chg('DELHIVERY'),  type:'Stock', cap:'Mid'   },
  { symbol:'AAPL',        name:'Affle (India) Ltd',                 exchange:'NSE', sector:'IT',          price:1545,  chg:chg('AAPL'),       type:'Stock', cap:'Mid'   },
  { symbol:'AFFLE',       name:'Affle (India) Ltd',                 exchange:'NSE', sector:'IT',          price:1545,  chg:chg('AFFLE'),      type:'Stock', cap:'Mid'   },
  { symbol:'CDSL',        name:'Central Depository Services (India)',exchange:'NSE', sector:'Financials', price:1845,  chg:chg('CDSL'),       type:'Stock', cap:'Mid'   },
  { symbol:'BSE',         name:'BSE Ltd',                           exchange:'NSE', sector:'Financials',  price:5245,  chg:chg('BSE'),        type:'Stock', cap:'Mid'   },
  { symbol:'MCX',         name:'Multi Commodity Exchange of India', exchange:'NSE', sector:'Financials',  price:6345,  chg:chg('MCX'),        type:'Stock', cap:'Mid'   },
  { symbol:'CAMS',        name:'Computer Age Management Services',  exchange:'NSE', sector:'Financials',  price:4512,  chg:chg('CAMS'),       type:'Stock', cap:'Mid'   },
  { symbol:'PHOENIXLTD',  name:'The Phoenix Mills Ltd',             exchange:'NSE', sector:'Real Estate', price:1845,  chg:chg('PHOENIXLTD'), type:'Stock', cap:'Mid'   },
  { symbol:'PRESTIGE',    name:'Prestige Estates Projects Ltd',     exchange:'NSE', sector:'Real Estate', price:1642,  chg:chg('PRESTIGE'),   type:'Stock', cap:'Mid'   },
  { symbol:'GODREJPROP',  name:'Godrej Properties Ltd',             exchange:'NSE', sector:'Real Estate', price:2845,  chg:chg('GODREJPROP'), type:'Stock', cap:'Mid'   },
  { symbol:'LODHA',       name:'Macrotech Developers (Lodha)',      exchange:'NSE', sector:'Real Estate', price:1312,  chg:chg('LODHA'),      type:'Stock', cap:'Mid'   },
  { symbol:'KALYANKJIL',  name:'Kalyan Jewellers India Ltd',        exchange:'NSE', sector:'Consumer',    price:545,   chg:chg('KALYANKJIL'), type:'Stock', cap:'Mid'   },
  { symbol:'SENCO',       name:'Senco Gold Ltd',                    exchange:'NSE', sector:'Consumer',    price:1245,  chg:chg('SENCO'),      type:'Stock', cap:'Mid'   },
  { symbol:'PAGEIND',     name:'Page Industries Ltd',               exchange:'NSE', sector:'Consumer',    price:42500, chg:chg('PAGEIND'),    type:'Stock', cap:'Mid'   },
  { symbol:'VSTIND',      name:'VST Industries Ltd',                exchange:'NSE', sector:'FMCG',        price:4512,  chg:chg('VSTIND'),     type:'Stock', cap:'Mid'   },
  { symbol:'RADICO',      name:'Radico Khaitan Ltd',                exchange:'NSE', sector:'FMCG',        price:2145,  chg:chg('RADICO'),     type:'Stock', cap:'Mid'   },
  { symbol:'ABBOTINDIA',  name:'Abbott India Ltd',                  exchange:'NSE', sector:'Pharma',      price:28450, chg:chg('ABBOTINDIA'), type:'Stock', cap:'Mid'   },
  { symbol:'ALKEM',       name:'Alkem Laboratories Ltd',            exchange:'NSE', sector:'Pharma',      price:5845,  chg:chg('ALKEM'),      type:'Stock', cap:'Mid'   },
  { symbol:'IPCALAB',     name:'IPCA Laboratories Ltd',             exchange:'NSE', sector:'Pharma',      price:1645,  chg:chg('IPCALAB'),    type:'Stock', cap:'Mid'   },
  { symbol:'SYNGENE',     name:'Syngene International Ltd',         exchange:'NSE', sector:'Pharma',      price:845,   chg:chg('SYNGENE'),    type:'Stock', cap:'Mid'   },
  { symbol:'METROPOLIS',  name:'Metropolis Healthcare Ltd',         exchange:'NSE', sector:'Healthcare',  price:2145,  chg:chg('METROPOLIS'), type:'Stock', cap:'Mid'   },
  { symbol:'THYROCARE',   name:'Thyrocare Technologies Ltd',        exchange:'NSE', sector:'Healthcare',  price:712,   chg:chg('THYROCARE'),  type:'Stock', cap:'Mid'   },
  { symbol:'VIJAYABANK',  name:'Karnataka Bank Ltd',                exchange:'NSE', sector:'Financials',  price:245,   chg:chg('VIJAYABANK'), type:'Stock', cap:'Mid'   },
  { symbol:'FEDERALBNK',  name:'Federal Bank Ltd',                  exchange:'NSE', sector:'Financials',  price:195,   chg:chg('FEDERALBNK'), type:'Stock', cap:'Mid'   },
  { symbol:'IDFCFIRSTB',  name:'IDFC First Bank Ltd',               exchange:'NSE', sector:'Financials',  price:75,    chg:chg('IDFCFIRSTB'), type:'Stock', cap:'Mid'   },
  { symbol:'RBLBANK',     name:'RBL Bank Ltd',                      exchange:'NSE', sector:'Financials',  price:215,   chg:chg('RBLBANK'),    type:'Stock', cap:'Mid'   },
  { symbol:'AUBANK',      name:'AU Small Finance Bank Ltd',         exchange:'NSE', sector:'Financials',  price:678,   chg:chg('AUBANK'),     type:'Stock', cap:'Mid'   },
  { symbol:'UJJIVANSFB',  name:'Ujjivan Small Finance Bank Ltd',    exchange:'NSE', sector:'Financials',  price:42,    chg:chg('UJJIVANSFB'), type:'Stock', cap:'Small' },
  { symbol:'CREDITACC',   name:'CreditAccess Grameen Ltd',          exchange:'NSE', sector:'Financials',  price:1245,  chg:chg('CREDITACC'),  type:'Stock', cap:'Mid'   },
  { symbol:'FINEORG',     name:'Fine Organic Industries Ltd',       exchange:'NSE', sector:'Chemicals',   price:5245,  chg:chg('FINEORG'),    type:'Stock', cap:'Mid'   },
  { symbol:'DEEPAKNTR',   name:'Deepak Nitrite Ltd',                exchange:'NSE', sector:'Chemicals',   price:2845,  chg:chg('DEEPAKNTR'),  type:'Stock', cap:'Mid'   },
  { symbol:'GNFC',        name:'Gujarat Narmada Valley Fertilizers',exchange:'NSE', sector:'Chemicals',   price:645,   chg:chg('GNFC'),       type:'Stock', cap:'Mid'   },
  { symbol:'AAVAS',       name:'Aavas Financiers Ltd',              exchange:'NSE', sector:'Financials',  price:1912,  chg:chg('AAVAS'),      type:'Stock', cap:'Mid'   },
  { symbol:'HOMEFIRST',   name:'Home First Finance Company India',  exchange:'NSE', sector:'Financials',  price:1145,  chg:chg('HOMEFIRST'),  type:'Stock', cap:'Small' },
  { symbol:'INDIAMART',   name:'IndiaMART InterMESH Ltd',           exchange:'NSE', sector:'IT',          price:2845,  chg:chg('INDIAMART'),  type:'Stock', cap:'Mid'   },
  { symbol:'JUSTDIAL',    name:'Just Dial Ltd',                     exchange:'NSE', sector:'IT',          price:1145,  chg:chg('JUSTDIAL'),   type:'Stock', cap:'Mid'   },
  { symbol:'NAZARA',      name:'Nazara Technologies Ltd',           exchange:'NSE', sector:'IT',          price:1045,  chg:chg('NAZARA'),     type:'Stock', cap:'Small' },
  { symbol:'HAPPYFORGE',  name:'Happy Forgings Ltd',                exchange:'NSE', sector:'Industrials', price:845,   chg:chg('HAPPYFORGE'), type:'Stock', cap:'Small' },
  { symbol:'TATAINVEST',  name:'Tata Investment Corporation Ltd',   exchange:'NSE', sector:'Financials',  price:7845,  chg:chg('TATAINVEST'), type:'Stock', cap:'Mid'   },
  { symbol:'ESCORTS',     name:'Escorts Kubota Ltd',                exchange:'NSE', sector:'Industrials', price:3512,  chg:chg('ESCORTS'),    type:'Stock', cap:'Mid'   },
  { symbol:'BHEL',        name:'Bharat Heavy Electricals Ltd',      exchange:'NSE', sector:'Capital Goods',price:298,  chg:chg('BHEL'),       type:'Stock', cap:'Large' },
  { symbol:'CONCOR',      name:'Container Corporation of India',    exchange:'NSE', sector:'Logistics',   price:812,   chg:chg('CONCOR'),     type:'Stock', cap:'Mid'   },
  { symbol:'BLUEDART',    name:'Blue Dart Express Ltd',             exchange:'NSE', sector:'Logistics',   price:7845,  chg:chg('BLUEDART'),   type:'Stock', cap:'Mid'   },
  { symbol:'VBL',         name:'Varun Beverages Ltd',               exchange:'NSE', sector:'FMCG',        price:562,   chg:chg('VBL'),        type:'Stock', cap:'Large' },
  { symbol:'COLPAL',      name:'Colgate-Palmolive (India) Ltd',     exchange:'NSE', sector:'FMCG',        price:2912,  chg:chg('COLPAL'),     type:'Stock', cap:'Large' },
  { symbol:'DABUR',       name:'Dabur India Ltd',                   exchange:'NSE', sector:'FMCG',        price:548,   chg:chg('DABUR'),      type:'Stock', cap:'Large' },
  { symbol:'EMAMILTD',    name:'Emami Ltd',                         exchange:'NSE', sector:'FMCG',        price:678,   chg:chg('EMAMILTD'),   type:'Stock', cap:'Mid'   },
  { symbol:'ZYDUSLIFE',   name:'Zydus Lifesciences Ltd',            exchange:'NSE', sector:'Pharma',      price:1245,  chg:chg('ZYDUSLIFE'),  type:'Stock', cap:'Large' },
  { symbol:'AUROPHARMA',  name:'Aurobindo Pharma Ltd',              exchange:'NSE', sector:'Pharma',      price:1312,  chg:chg('AUROPHARMA'), type:'Stock', cap:'Mid'   },
  { symbol:'GRANULES',    name:'Granules India Ltd',                exchange:'NSE', sector:'Pharma',      price:512,   chg:chg('GRANULES'),   type:'Stock', cap:'Small' },
  { symbol:'LAURUSLABS',  name:'Laurus Labs Ltd',                   exchange:'NSE', sector:'Pharma',      price:425,   chg:chg('LAURUSLABS'), type:'Stock', cap:'Mid'   },
  { symbol:'GLAND',       name:'Gland Pharma Ltd',                  exchange:'NSE', sector:'Pharma',      price:1845,  chg:chg('GLAND'),      type:'Stock', cap:'Mid'   },
  { symbol:'ICICIGI',     name:'ICICI Lombard General Insurance',   exchange:'NSE', sector:'Insurance',   price:2145,  chg:chg('ICICIGI'),    type:'Stock', cap:'Large' },
  { symbol:'STARHEALTH',  name:'Star Health and Allied Insurance',  exchange:'NSE', sector:'Insurance',   price:512,   chg:chg('STARHEALTH'), type:'Stock', cap:'Mid'   },
  { symbol:'NIACL',       name:'New India Assurance Company',       exchange:'NSE', sector:'Insurance',   price:245,   chg:chg('NIACL'),      type:'Stock', cap:'Mid'   },
  { symbol:'CUMMINSIND',  name:'Cummins India Ltd',                 exchange:'NSE', sector:'Industrials', price:3512,  chg:chg('CUMMINSIND'), type:'Stock', cap:'Mid'   },
  { symbol:'ABB',         name:'ABB India Ltd',                     exchange:'NSE', sector:'Capital Goods',price:8245, chg:chg('ABB'),        type:'Stock', cap:'Large' },
  { symbol:'THERMAX',     name:'Thermax Ltd',                       exchange:'NSE', sector:'Capital Goods',price:4512, chg:chg('THERMAX'),    type:'Stock', cap:'Mid'   },
  { symbol:'AIAENG',      name:'AIA Engineering Ltd',               exchange:'NSE', sector:'Industrials', price:4245,  chg:chg('AIAENG'),     type:'Stock', cap:'Mid'   },
]

// ============================================================
// NIFTY Smallcap / Emerging
// ============================================================
const SMALLCAP: UniverseItem[] = [
  { symbol:'IRFC',        name:'Indian Railway Finance Corporation',exchange:'NSE', sector:'Financials',  price:178,   chg:chg('IRFC'),       type:'Stock', cap:'Mid'   },
  { symbol:'RVNL',        name:'Rail Vikas Nigam Ltd',              exchange:'NSE', sector:'Infrastructure',price:312,  chg:chg('RVNL'),      type:'Stock', cap:'Mid'   },
  { symbol:'RAILTEL',     name:'RailTel Corporation of India',      exchange:'NSE', sector:'IT',          price:478,   chg:chg('RAILTEL'),    type:'Stock', cap:'Small' },
  { symbol:'IRCON',       name:'Ircon International Ltd',           exchange:'NSE', sector:'Infrastructure',price:245,  chg:chg('IRCON'),     type:'Stock', cap:'Mid'   },
  { symbol:'NBCC',        name:'NBCC (India) Ltd',                  exchange:'NSE', sector:'Infrastructure',price:178,  chg:chg('NBCC'),      type:'Stock', cap:'Mid'   },
  { symbol:'HUDCO',       name:'Housing and Urban Development Corp',exchange:'NSE', sector:'Financials',  price:245,   chg:chg('HUDCO'),      type:'Stock', cap:'Mid'   },
  { symbol:'IFCI',        name:'IFCI Ltd',                          exchange:'NSE', sector:'Financials',  price:42,    chg:chg('IFCI'),       type:'Stock', cap:'Small' },
  { symbol:'IDBI',        name:'IDBI Bank Ltd',                     exchange:'NSE', sector:'Financials',  price:85,    chg:chg('IDBI'),       type:'Stock', cap:'Mid'   },
  { symbol:'TATACHEM',    name:'Tata Chemicals Ltd',                exchange:'NSE', sector:'Chemicals',   price:1145,  chg:chg('TATACHEM'),   type:'Stock', cap:'Mid'   },
  { symbol:'PIDILITIND',  name:'Pidilite Industries Ltd',           exchange:'NSE', sector:'Chemicals',   price:3245,  chg:chg('PIDILITIND'), type:'Stock', cap:'Large' },
  { symbol:'RELAXO',      name:'Relaxo Footwears Ltd',              exchange:'NSE', sector:'Consumer',    price:845,   chg:chg('RELAXO'),     type:'Stock', cap:'Mid'   },
  { symbol:'CAMPUS',      name:'Campus Activewear Ltd',             exchange:'NSE', sector:'Consumer',    price:245,   chg:chg('CAMPUS'),     type:'Stock', cap:'Small' },
  { symbol:'VMART',       name:'V-Mart Retail Ltd',                 exchange:'NSE', sector:'Retail',      price:2245,  chg:chg('VMART'),      type:'Stock', cap:'Small' },
  { symbol:'SHOPPERS',    name:'Shoppers Stop Ltd',                 exchange:'NSE', sector:'Retail',      price:878,   chg:chg('SHOPPERS'),   type:'Stock', cap:'Small' },
  { symbol:'INOXGREEN',   name:'INOX Green Energy Services Ltd',    exchange:'NSE', sector:'Utilities',   price:178,   chg:chg('INOXGREEN'),  type:'Stock', cap:'Small' },
  { symbol:'ADANIGREEN',  name:'Adani Green Energy Ltd',            exchange:'NSE', sector:'Utilities',   price:1845,  chg:chg('ADANIGREEN'), type:'Stock', cap:'Large' },
  { symbol:'ADANITRANS',  name:'Adani Transmission Ltd',            exchange:'NSE', sector:'Utilities',   price:945,   chg:chg('ADANITRANS'), type:'Stock', cap:'Large' },
  { symbol:'BOMDYEING',   name:'Bombay Dyeing & Manufacturing',     exchange:'NSE', sector:'Textiles',    price:245,   chg:chg('BOMDYEING'),  type:'Stock', cap:'Small' },
  { symbol:'TRIDENT',     name:'Trident Ltd',                       exchange:'NSE', sector:'Textiles',    price:42,    chg:chg('TRIDENT'),    type:'Stock', cap:'Mid'   },
  { symbol:'WELSPUNIND',  name:'Welspun India Ltd',                 exchange:'NSE', sector:'Textiles',    price:178,   chg:chg('WELSPUNIND'), type:'Stock', cap:'Mid'   },
  { symbol:'PAGEIND',     name:'Page Industries Ltd',               exchange:'NSE', sector:'Textiles',    price:42500, chg:chg('PAGEIND2'),   type:'Stock', cap:'Mid'   },
  { symbol:'WONDERLA',    name:'Wonderla Holidays Ltd',             exchange:'NSE', sector:'Hospitality', price:845,   chg:chg('WONDERLA'),   type:'Stock', cap:'Small' },
  { symbol:'CHALET',      name:'Chalet Hotels Ltd',                 exchange:'NSE', sector:'Hospitality', price:945,   chg:chg('CHALET'),     type:'Stock', cap:'Small' },
  { symbol:'LEMONTREE',   name:'Lemon Tree Hotels Ltd',             exchange:'NSE', sector:'Hospitality', price:145,   chg:chg('LEMONTREE'),  type:'Stock', cap:'Small' },
  { symbol:'ELIXIR',      name:'Elixir Equities Ltd',               exchange:'NSE', sector:'Financials',  price:245,   chg:chg('ELIXIR'),     type:'Stock', cap:'Small' },
]

// ============================================================
// BSE-specific / additional stocks
// ============================================================
const BSE_STOCKS: UniverseItem[] = [
  { symbol:'MAHINDCIE',  name:'Mahindra CIE Automotive Ltd',       exchange:'BSE', sector:'Auto',        price:545,   chg:chg('MAHINDCIE'),  type:'Stock', cap:'Mid'   },
  { symbol:'SKFINDIA',   name:'SKF India Ltd',                     exchange:'BSE', sector:'Industrials', price:5845,  chg:chg('SKFINDIA'),   type:'Stock', cap:'Mid'   },
  { symbol:'TIMKEN',     name:'Timken India Ltd',                   exchange:'BSE', sector:'Industrials', price:4245,  chg:chg('TIMKEN'),     type:'Stock', cap:'Mid'   },
  { symbol:'SCHAEFFLER', name:'Schaeffler India Ltd',              exchange:'BSE', sector:'Industrials', price:4512,  chg:chg('SCHAEFFLER'), type:'Stock', cap:'Mid'   },
  { symbol:'GREAVESCOT',  name:'Greaves Cotton Ltd',               exchange:'BSE', sector:'Industrials', price:212,   chg:chg('GREAVESCOT'), type:'Stock', cap:'Small' },
  { symbol:'EIDPARRY',   name:'EID Parry (India) Ltd',             exchange:'BSE', sector:'FMCG',        price:878,   chg:chg('EIDPARRY'),   type:'Stock', cap:'Mid'   },
  { symbol:'TRIVENI',    name:'Triveni Engineering & Industries',  exchange:'BSE', sector:'FMCG',        price:378,   chg:chg('TRIVENI'),    type:'Stock', cap:'Small' },
  { symbol:'BAJAJHIND',  name:'Bajaj Hindusthan Sugar Ltd',        exchange:'BSE', sector:'FMCG',        price:42,    chg:chg('BAJAJHIND'),  type:'Stock', cap:'Small' },
  { symbol:'SHREECHEM',  name:'Shree Cement Ltd',                  exchange:'BSE', sector:'Materials',   price:28450, chg:chg('SHREECHEM'),  type:'Stock', cap:'Large' },
  { symbol:'JKCEMENT',   name:'JK Cement Ltd',                     exchange:'BSE', sector:'Materials',   price:4845,  chg:chg('JKCEMENT'),   type:'Stock', cap:'Mid'   },
  { symbol:'RAMCOCEM',   name:'The Ramco Cements Ltd',             exchange:'BSE', sector:'Materials',   price:1045,  chg:chg('RAMCOCEM'),   type:'Stock', cap:'Mid'   },
  { symbol:'HEIDELBERG', name:'Heidelberg Materials India Ltd',    exchange:'BSE', sector:'Materials',   price:212,   chg:chg('HEIDELBERG'), type:'Stock', cap:'Small' },
  { symbol:'ORIENTCEM',  name:'Orient Cement Ltd',                 exchange:'BSE', sector:'Materials',   price:245,   chg:chg('ORIENTCEM'),  type:'Stock', cap:'Small' },
  { symbol:'JKLAKSHMI',  name:'JK Lakshmi Cement Ltd',             exchange:'BSE', sector:'Materials',   price:878,   chg:chg('JKLAKSHMI'),  type:'Stock', cap:'Small' },
  { symbol:'NUVOCO',     name:'Nuvoco Vistas Corporation Ltd',     exchange:'BSE', sector:'Materials',   price:345,   chg:chg('NUVOCO'),     type:'Stock', cap:'Small' },
  { symbol:'WOCKPHARMA', name:'Wockhardt Ltd',                     exchange:'BSE', sector:'Pharma',      price:1345,  chg:chg('WOCKPHARMA'), type:'Stock', cap:'Small' },
  { symbol:'FDC',        name:'FDC Ltd',                           exchange:'BSE', sector:'Pharma',      price:545,   chg:chg('FDC'),        type:'Stock', cap:'Small' },
  { symbol:'JUBLPHARMA', name:'Jubilant Pharmova Ltd',             exchange:'BSE', sector:'Pharma',      price:1045,  chg:chg('JUBLPHARMA'), type:'Stock', cap:'Mid'   },
  { symbol:'STRIDES',    name:'Strides Pharma Science Ltd',        exchange:'BSE', sector:'Pharma',      price:1245,  chg:chg('STRIDES'),    type:'Stock', cap:'Small' },
  { symbol:'SEQUENT',    name:'SeQuent Scientific Ltd',            exchange:'BSE', sector:'Pharma',      price:145,   chg:chg('SEQUENT'),    type:'Stock', cap:'Small' },
  { symbol:'STERLINBIO', name:'Sterling Biotech Ltd',              exchange:'BSE', sector:'Pharma',      price:245,   chg:chg('STERLINBIO'), type:'Stock', cap:'Small' },
  { symbol:'PNBGILTS',   name:'PNB Gilts Ltd',                     exchange:'BSE', sector:'Financials',  price:112,   chg:chg('PNBGILTS'),   type:'Stock', cap:'Small' },
  { symbol:'GENESYS',    name:'Genesys International Corporation', exchange:'BSE', sector:'IT',          price:845,   chg:chg('GENESYS'),    type:'Stock', cap:'Small' },
  { symbol:'MASTEK',     name:'Mastek Ltd',                        exchange:'BSE', sector:'IT',          price:2845,  chg:chg('MASTEK'),     type:'Stock', cap:'Small' },
  { symbol:'KPITTECH',   name:'KPIT Technologies Ltd',             exchange:'BSE', sector:'IT',          price:1745,  chg:chg('KPITTECH'),   type:'Stock', cap:'Mid'   },
  { symbol:'TANLA',      name:'Tanla Platforms Ltd',               exchange:'BSE', sector:'IT',          price:1045,  chg:chg('TANLA'),      type:'Stock', cap:'Mid'   },
  { symbol:'DATAMATICS', name:'Datamatics Global Services Ltd',    exchange:'BSE', sector:'IT',          price:845,   chg:chg('DATAMATICS'), type:'Stock', cap:'Small' },
  { symbol:'BSOFT',      name:'BSOFT Technologies Ltd',            exchange:'BSE', sector:'IT',          price:545,   chg:chg('BSOFT'),      type:'Stock', cap:'Small' },
  { symbol:'NIITLTD',    name:'NIIT Ltd',                          exchange:'BSE', sector:'IT',          price:245,   chg:chg('NIITLTD'),    type:'Stock', cap:'Small' },
  { symbol:'MSTCLTD',    name:'MSTC Ltd',                          exchange:'BSE', sector:'Retail',      price:645,   chg:chg('MSTCLTD'),    type:'Stock', cap:'Small' },
]

// ============================================================
// NSE ETFs
// ============================================================
const ETFS: UniverseItem[] = [
  { symbol:'NIFTYBEES',  name:'Nippon India ETF Nifty BeES',        exchange:'NSE', sector:'Index',    price:245,   chg:chg('NIFTYBEES'),  type:'ETF', cap:'N/A' },
  { symbol:'JUNIORBEES', name:'Nippon India ETF Junior BeES',       exchange:'NSE', sector:'Index',    price:785,   chg:chg('JUNIORBEES'), type:'ETF', cap:'N/A' },
  { symbol:'BANKBEES',   name:'Nippon India ETF Bank BeES',         exchange:'NSE', sector:'Index',    price:512,   chg:chg('BANKBEES'),   type:'ETF', cap:'N/A' },
  { symbol:'ITBEES',     name:'Nippon India ETF IT BeES',           exchange:'NSE', sector:'Index',    price:78,    chg:chg('ITBEES'),     type:'ETF', cap:'N/A' },
  { symbol:'PHARMABEES', name:'Nippon India ETF Pharma BeES',       exchange:'NSE', sector:'Index',    price:165,   chg:chg('PHARMABEES'), type:'ETF', cap:'N/A' },
  { symbol:'AUTOBEES',   name:'Nippon India ETF Auto BeES',         exchange:'NSE', sector:'Index',    price:245,   chg:chg('AUTOBEES'),   type:'ETF', cap:'N/A' },
  { symbol:'MOM50',      name:'Motilal Oswal Nifty Momentum 50 ETF',exchange:'NSE', sector:'Index',   price:182,   chg:chg('MOM50'),      type:'ETF', cap:'N/A' },
  { symbol:'MON100',     name:'Motilal Oswal Nasdaq 100 ETF',       exchange:'NSE', sector:'Index',    price:135,   chg:chg('MON100'),     type:'ETF', cap:'N/A' },
  { symbol:'MAFANG',     name:'Mirae Asset NYSE FANG+ ETF',         exchange:'NSE', sector:'Index',    price:98,    chg:chg('MAFANG'),     type:'ETF', cap:'N/A' },
  { symbol:'GOLDBEES',   name:'Nippon India ETF Gold BeES',         exchange:'NSE', sector:'Commodity',price:62,    chg:chg('GOLDBEES'),   type:'ETF', cap:'N/A' },
  { symbol:'SGOLD',      name:'SBI Gold ETF',                       exchange:'NSE', sector:'Commodity',price:65,    chg:chg('SGOLD'),      type:'ETF', cap:'N/A' },
  { symbol:'SILVERBEES', name:'Nippon India ETF Silver BeES',       exchange:'NSE', sector:'Commodity',price:95,    chg:chg('SILVERBEES'), type:'ETF', cap:'N/A' },
  { symbol:'LIQUIDBEES', name:'Nippon India ETF Liquid BeES',       exchange:'NSE', sector:'Debt',     price:1000,  chg:chg('LIQUIDBEES'), type:'ETF', cap:'N/A' },
  { symbol:'ICICINIFTY', name:'ICICI Prudential Nifty 50 ETF',      exchange:'NSE', sector:'Index',    price:245,   chg:chg('ICICINIFTY'), type:'ETF', cap:'N/A' },
  { symbol:'HDFCSENSEX', name:'HDFC Sensex ETF',                    exchange:'NSE', sector:'Index',    price:832,   chg:chg('HDFCSENSEX'), type:'ETF', cap:'N/A' },
  { symbol:'SETFNN50',   name:'SBI ETF Nifty Next 50',              exchange:'NSE', sector:'Index',    price:685,   chg:chg('SETFNN50'),   type:'ETF', cap:'N/A' },
  { symbol:'MIDCAPETF',  name:'Mirae Asset Nifty Midcap 150 ETF',   exchange:'NSE', sector:'Index',    price:178,   chg:chg('MIDCAPETF'),  type:'ETF', cap:'N/A' },
  { symbol:'SMALLCAPETF',name:'Nippon India ETF Nifty Smallcap 250',exchange:'NSE', sector:'Index',   price:82,    chg:chg('SMALLCAPETF'),type:'ETF', cap:'N/A' },
  { symbol:'NETFIT',     name:'Navi Nifty IT Index ETF',            exchange:'NSE', sector:'Index',    price:45,    chg:chg('NETFIT'),     type:'ETF', cap:'N/A' },
  { symbol:'CPSEETF',    name:'CPSE ETF (Public Sector)',           exchange:'NSE', sector:'Index',    price:112,   chg:chg('CPSEETF'),    type:'ETF', cap:'N/A' },
]

// ============================================================
// Popular Mutual Funds (Direct Plans)
// ============================================================
const MUTUAL_FUNDS: UniverseItem[] = [
  // ── Large Cap ───────────────────────────────────────────
  { symbol:'MFLC001', name:'Mirae Asset Large Cap Fund - Direct',         exchange:'NSE', sector:'MF: Large Cap',  price:115.42, chg:chg('MFLC001'), type:'MF', cap:'N/A' },
  { symbol:'AXLC001', name:'Axis Bluechip Fund - Direct',                 exchange:'NSE', sector:'MF: Large Cap',  price:68.35,  chg:chg('AXLC001'), type:'MF', cap:'N/A' },
  { symbol:'HDLC001', name:'HDFC Top 100 Fund - Direct',                  exchange:'NSE', sector:'MF: Large Cap',  price:945.82, chg:chg('HDLC001'), type:'MF', cap:'N/A' },
  { symbol:'NILC001', name:'Nippon India Large Cap Fund - Direct',        exchange:'NSE', sector:'MF: Large Cap',  price:82.45,  chg:chg('NILC001'), type:'MF', cap:'N/A' },
  { symbol:'SBLC001', name:'SBI Bluechip Fund - Direct',                  exchange:'NSE', sector:'MF: Large Cap',  price:78.32,  chg:chg('SBLC001'), type:'MF', cap:'N/A' },
  { symbol:'ICLC001', name:'ICICI Pru Bluechip Fund - Direct',            exchange:'NSE', sector:'MF: Large Cap',  price:98.75,  chg:chg('ICLC001'), type:'MF', cap:'N/A' },
  { symbol:'KOLC001', name:'Kotak Bluechip Fund - Direct',                exchange:'NSE', sector:'MF: Large Cap',  price:532.45, chg:chg('KOLC001'), type:'MF', cap:'N/A' },
  { symbol:'UFLC001', name:'UTI Nifty 50 Index Fund - Direct',            exchange:'NSE', sector:'MF: Index',      price:145.82, chg:chg('UFLC001'), type:'MF', cap:'N/A' },
  // ── Flexi Cap ───────────────────────────────────────────
  { symbol:'PPFC001', name:'Parag Parikh Flexi Cap Fund - Direct',        exchange:'NSE', sector:'MF: Flexi Cap',  price:78.45,  chg:chg('PPFC001'), type:'MF', cap:'N/A' },
  { symbol:'AXFC001', name:'Axis Flexi Cap Fund - Direct',                exchange:'NSE', sector:'MF: Flexi Cap',  price:20.85,  chg:chg('AXFC001'), type:'MF', cap:'N/A' },
  { symbol:'HDFC001', name:'HDFC Flexi Cap Fund - Direct',                exchange:'NSE', sector:'MF: Flexi Cap',  price:1845.32,chg:chg('HDFC001'), type:'MF', cap:'N/A' },
  { symbol:'UTFC001', name:'UTI Flexi Cap Fund - Direct',                 exchange:'NSE', sector:'MF: Flexi Cap',  price:312.45, chg:chg('UTFC001'), type:'MF', cap:'N/A' },
  { symbol:'QUFC001', name:'Quant Flexi Cap Fund - Direct',               exchange:'NSE', sector:'MF: Flexi Cap',  price:82.35,  chg:chg('QUFC001'), type:'MF', cap:'N/A' },
  // ── Mid Cap ─────────────────────────────────────────────
  { symbol:'MIMC001', name:'Mirae Asset Midcap Fund - Direct',            exchange:'NSE', sector:'MF: Mid Cap',    price:32.45,  chg:chg('MIMC001'), type:'MF', cap:'N/A' },
  { symbol:'NIMC001', name:'Nippon India Growth Fund (Mid Cap) - Direct', exchange:'NSE', sector:'MF: Mid Cap',    price:4845.32,chg:chg('NIMC001'), type:'MF', cap:'N/A' },
  { symbol:'HDMC001', name:'HDFC Mid-Cap Opportunities Fund - Direct',    exchange:'NSE', sector:'MF: Mid Cap',    price:182.45, chg:chg('HDMC001'), type:'MF', cap:'N/A' },
  { symbol:'AXMC001', name:'Axis Midcap Fund - Direct',                   exchange:'NSE', sector:'MF: Mid Cap',    price:98.45,  chg:chg('AXMC001'), type:'MF', cap:'N/A' },
  { symbol:'KOMC001', name:'Kotak Emerging Equity Fund - Direct',         exchange:'NSE', sector:'MF: Mid Cap',    price:145.82, chg:chg('KOMC001'), type:'MF', cap:'N/A' },
  { symbol:'SBMC001', name:'SBI Magnum Midcap Fund - Direct',             exchange:'NSE', sector:'MF: Mid Cap',    price:245.32, chg:chg('SBMC001'), type:'MF', cap:'N/A' },
  // ── Small Cap ───────────────────────────────────────────
  { symbol:'NISC001', name:'Nippon India Small Cap Fund - Direct',        exchange:'NSE', sector:'MF: Small Cap',  price:145.82, chg:chg('NISC001'), type:'MF', cap:'N/A' },
  { symbol:'SBSC001', name:'SBI Small Cap Fund - Direct',                 exchange:'NSE', sector:'MF: Small Cap',  price:145.85, chg:chg('SBSC001'), type:'MF', cap:'N/A' },
  { symbol:'AXSC001', name:'Axis Small Cap Fund - Direct',                exchange:'NSE', sector:'MF: Small Cap',  price:78.45,  chg:chg('AXSC001'), type:'MF', cap:'N/A' },
  { symbol:'HDSC001', name:'HDFC Small Cap Fund - Direct',                exchange:'NSE', sector:'MF: Small Cap',  price:112.45, chg:chg('HDSC001'), type:'MF', cap:'N/A' },
  { symbol:'QUSC001', name:'Quant Small Cap Fund - Direct',               exchange:'NSE', sector:'MF: Small Cap',  price:245.82, chg:chg('QUSC001'), type:'MF', cap:'N/A' },
  { symbol:'ICSC001', name:'ICICI Pru Smallcap Fund - Direct',            exchange:'NSE', sector:'MF: Small Cap',  price:82.45,  chg:chg('ICSC001'), type:'MF', cap:'N/A' },
  // ── ELSS (Tax Saving) ───────────────────────────────────
  { symbol:'AXEL001', name:'Axis Long Term Equity Fund (ELSS) - Direct',  exchange:'NSE', sector:'MF: ELSS',       price:78.45,  chg:chg('AXEL001'), type:'MF', cap:'N/A' },
  { symbol:'MIEL001', name:'Mirae Asset Tax Saver Fund (ELSS) - Direct',  exchange:'NSE', sector:'MF: ELSS',       price:42.85,  chg:chg('MIEL001'), type:'MF', cap:'N/A' },
  { symbol:'NIEL001', name:'Nippon India Tax Saver (ELSS) - Direct',      exchange:'NSE', sector:'MF: ELSS',       price:98.45,  chg:chg('NIEL001'), type:'MF', cap:'N/A' },
  { symbol:'SBEL001', name:'SBI Long Term Equity Fund (ELSS) - Direct',   exchange:'NSE', sector:'MF: ELSS',       price:445.82, chg:chg('SBEL001'), type:'MF', cap:'N/A' },
  { symbol:'QUEL001', name:'Quant ELSS Tax Saver Fund - Direct',          exchange:'NSE', sector:'MF: ELSS',       price:312.45, chg:chg('QUEL001'), type:'MF', cap:'N/A' },
  // ── Index Funds ─────────────────────────────────────────
  { symbol:'UTNF001', name:'UTI Nifty 50 Index Fund - Direct',            exchange:'NSE', sector:'MF: Index',      price:145.82, chg:chg('UTNF001'), type:'MF', cap:'N/A' },
  { symbol:'HDNF001', name:'HDFC Index Fund Nifty 50 Plan - Direct',      exchange:'NSE', sector:'MF: Index',      price:245.32, chg:chg('HDNF001'), type:'MF', cap:'N/A' },
  { symbol:'SBNF001', name:'SBI Nifty Index Fund - Direct',               exchange:'NSE', sector:'MF: Index',      price:245.45, chg:chg('SBNF001'), type:'MF', cap:'N/A' },
  { symbol:'MONF001', name:'Motilal Oswal Nifty 50 Index Fund - Direct',  exchange:'NSE', sector:'MF: Index',      price:25.82,  chg:chg('MONF001'), type:'MF', cap:'N/A' },
  { symbol:'MINN001', name:'Mirae Asset Nifty Next 50 ETF FoF - Direct',  exchange:'NSE', sector:'MF: Index',      price:18.45,  chg:chg('MINN001'), type:'MF', cap:'N/A' },
  { symbol:'NANQ001', name:'Nippon India Nasdaq 100 FoF - Direct',        exchange:'NSE', sector:'MF: Index',      price:18.85,  chg:chg('NANQ001'), type:'MF', cap:'N/A' },
  { symbol:'MONQ001', name:'Motilal Oswal Nasdaq 100 FoF - Direct',       exchange:'NSE', sector:'MF: Index',      price:28.45,  chg:chg('MONQ001'), type:'MF', cap:'N/A' },
  // ── Hybrid ──────────────────────────────────────────────
  { symbol:'PPBF001', name:'ICICI Pru Balanced Advantage Fund - Direct',  exchange:'NSE', sector:'MF: Hybrid',     price:68.45,  chg:chg('PPBF001'), type:'MF', cap:'N/A' },
  { symbol:'HDBF001', name:'HDFC Balanced Advantage Fund - Direct',       exchange:'NSE', sector:'MF: Hybrid',     price:512.45, chg:chg('HDBF001'), type:'MF', cap:'N/A' },
  { symbol:'KOBF001', name:'Kotak Balanced Advantage Fund - Direct',      exchange:'NSE', sector:'MF: Hybrid',     price:18.85,  chg:chg('KOBF001'), type:'MF', cap:'N/A' },
  { symbol:'SBBF001', name:'SBI Equity Hybrid Fund - Direct',             exchange:'NSE', sector:'MF: Hybrid',     price:298.45, chg:chg('SBBF001'), type:'MF', cap:'N/A' },
  { symbol:'AXBF001', name:'Axis Equity Hybrid Fund - Direct',            exchange:'NSE', sector:'MF: Hybrid',     price:28.45,  chg:chg('AXBF001'), type:'MF', cap:'N/A' },
  // ── Debt ────────────────────────────────────────────────
  { symbol:'ABSL001', name:'Aditya Birla SL Short Term Fund - Direct',    exchange:'NSE', sector:'MF: Debt',       price:48.45,  chg:chg('ABSL001'), type:'MF', cap:'N/A' },
  { symbol:'HDDT001', name:'HDFC Corporate Bond Fund - Direct',           exchange:'NSE', sector:'MF: Debt',       price:32.45,  chg:chg('HDDT001'), type:'MF', cap:'N/A' },
  { symbol:'NICB001', name:'Nippon India Credit Risk Fund - Direct',      exchange:'NSE', sector:'MF: Debt',       price:18.45,  chg:chg('NICB001'), type:'MF', cap:'N/A' },
  { symbol:'ICITDT01', name:'ICICI Pru Liquid Fund - Direct',             exchange:'NSE', sector:'MF: Liquid',     price:345.85, chg:chg('ICITDT01'),type:'MF', cap:'N/A' },
  { symbol:'HDLQ001', name:'HDFC Liquid Fund - Direct',                   exchange:'NSE', sector:'MF: Liquid',     price:4512.45,chg:chg('HDLQ001'), type:'MF', cap:'N/A' },
  // ── Sectoral ────────────────────────────────────────────
  { symbol:'MFTEC01', name:'Mirae Asset NYSE FANG+ ETF FoF - Direct',     exchange:'NSE', sector:'MF: Tech',       price:22.85,  chg:chg('MFTEC01'), type:'MF', cap:'N/A' },
  { symbol:'NIBFS01', name:'Nippon India Banking & PSU Debt - Direct',    exchange:'NSE', sector:'MF: Banking',    price:18.45,  chg:chg('NIBFS01'), type:'MF', cap:'N/A' },
  { symbol:'SBHCS01', name:'SBI Healthcare Opportunities Fund - Direct',  exchange:'NSE', sector:'MF: Healthcare', price:378.45, chg:chg('SBHCS01'), type:'MF', cap:'N/A' },
  { symbol:'NIPHC01', name:'Nippon India Pharma Fund - Direct',           exchange:'NSE', sector:'MF: Healthcare', price:482.45, chg:chg('NIPHC01'), type:'MF', cap:'N/A' },
  { symbol:'TAIFC01', name:'Tata India Consumer Fund - Direct',           exchange:'NSE', sector:'MF: Consumer',   price:28.45,  chg:chg('TAIFC01'), type:'MF', cap:'N/A' },
  { symbol:'QUACT01', name:'Quant Active Fund - Direct',                  exchange:'NSE', sector:'MF: Flexi Cap',  price:645.82, chg:chg('QUACT01'), type:'MF', cap:'N/A' },
  { symbol:'QUQNT01', name:'Quant Quantamental Fund - Direct',            exchange:'NSE', sector:'MF: Quant',      price:22.45,  chg:chg('QUQNT01'), type:'MF', cap:'N/A' },
  { symbol:'WHYCAP01',name:'WhiteOak Capital Flexi Cap Fund - Direct',    exchange:'NSE', sector:'MF: Flexi Cap',  price:18.85,  chg:chg('WHYCAP01'),type:'MF', cap:'N/A' },
]

// ============================================================
// Combined & exported
// ============================================================
export const STOCK_UNIVERSE: UniverseItem[] = [
  ...NIFTY50,
  ...NIFTY_NEXT50,
  ...MIDCAP,
  ...SMALLCAP,
  ...BSE_STOCKS,
  ...ETFS,
  ...MUTUAL_FUNDS,
]

// De-duplicate by symbol (keep first occurrence), then enrich with fundamentals
const seen = new Set<string>()
export const UNIVERSE: UniverseItem[] = STOCK_UNIVERSE
  .filter(item => {
    if (seen.has(item.symbol)) return false
    seen.add(item.symbol)
    return true
  })
  .map(item => ({
    ...item,
    ...mkFund(item.symbol, item.price, item.type, item.sector),
  }))

/** Fast fuzzy search: matches symbol or name (case-insensitive) */
export function searchUniverse(query: string, limit = 20): UniverseItem[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const exact: UniverseItem[] = []
  const starts: UniverseItem[] = []
  const contains: UniverseItem[] = []

  for (const item of UNIVERSE) {
    const sym  = item.symbol.toLowerCase()
    const name = item.name.toLowerCase()
    if (sym === q || name === q) { exact.push(item); continue }
    if (sym.startsWith(q) || name.startsWith(q)) { starts.push(item); continue }
    if (sym.includes(q) || name.includes(q)) contains.push(item)
  }
  return [...exact, ...starts, ...contains].slice(0, limit)
}

/** Get by exact symbol */
export function getBySymbol(symbol: string): UniverseItem | undefined {
  return UNIVERSE.find(i => i.symbol === symbol.toUpperCase())
}
