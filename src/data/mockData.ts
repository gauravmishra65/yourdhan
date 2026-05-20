// ============================================================
// YourDhan – Mock Data  (US / India ETF Portfolio Analytics)
// ============================================================

// -------------------------------------------------------
// 1. ANNUAL_RETURNS  –  10 ETFs × 25 years (2000-2024)
// -------------------------------------------------------
export const ANNUAL_RETURNS: Record<string, Record<number, number>> = {
  SPY: {
    2000: -0.091, 2001: -0.119, 2002: -0.221, 2003:  0.287, 2004:  0.108,
    2005:  0.048, 2006:  0.157, 2007:  0.055, 2008: -0.370, 2009:  0.265,
    2010:  0.151, 2011:  0.021, 2012:  0.160, 2013:  0.324, 2014:  0.136,
    2015:  0.014, 2016:  0.119, 2017:  0.215, 2018: -0.044, 2019:  0.314,
    2020:  0.184, 2021:  0.288, 2022: -0.181, 2023:  0.264, 2024:  0.235,
  },
  QQQ: {
    2000: -0.368, 2001: -0.327, 2002: -0.376, 2003:  0.497, 2004:  0.105,
    2005:  0.019, 2006:  0.068, 2007:  0.189, 2008: -0.490, 2009:  0.553,
    2010:  0.197, 2011:  0.028, 2012:  0.182, 2013:  0.365, 2014:  0.197,
    2015:  0.094, 2016:  0.069, 2017:  0.327, 2018: -0.012, 2019:  0.390,
    2020:  0.485, 2021:  0.272, 2022: -0.328, 2023:  0.547, 2024:  0.253,
  },
  BND: {
    2000:  0.114, 2001:  0.084, 2002:  0.098, 2003:  0.041, 2004:  0.043,
    2005:  0.024, 2006:  0.042, 2007:  0.069, 2008:  0.055, 2009:  0.060,
    2010:  0.065, 2011:  0.076, 2012:  0.040, 2013: -0.022, 2014:  0.059,
    2015:  0.005, 2016:  0.026, 2017:  0.035, 2018: -0.002, 2019:  0.086,
    2020:  0.077, 2021: -0.018, 2022: -0.130, 2023:  0.055, 2024:  0.042,
  },
  GLD: {
    2000: -0.055, 2001:  0.023, 2002:  0.248, 2003:  0.197, 2004:  0.051,
    2005:  0.178, 2006:  0.228, 2007:  0.311, 2008: -0.017, 2009:  0.242,
    2010:  0.297, 2011:  0.100, 2012:  0.069, 2013: -0.283, 2014: -0.015,
    2015: -0.101, 2016:  0.081, 2017:  0.131, 2018: -0.018, 2019:  0.183,
    2020:  0.252, 2021: -0.035, 2022: -0.001, 2023:  0.131, 2024:  0.278,
  },
  VNQ: {
    2000:  0.265, 2001:  0.138, 2002:  0.035, 2003:  0.363, 2004:  0.318,
    2005:  0.122, 2006:  0.350, 2007: -0.156, 2008: -0.370, 2009:  0.285,
    2010:  0.282, 2011:  0.080, 2012:  0.185, 2013:  0.026, 2014:  0.301,
    2015:  0.026, 2016:  0.082, 2017:  0.046, 2018: -0.059, 2019:  0.290,
    2020: -0.049, 2021:  0.409, 2022: -0.264, 2023:  0.124, 2024:  0.058,
  },
  EFA: {
    2000: -0.148, 2001: -0.213, 2002: -0.159, 2003:  0.384, 2004:  0.203,
    2005:  0.136, 2006:  0.264, 2007:  0.112, 2008: -0.432, 2009:  0.316,
    2010:  0.079, 2011: -0.118, 2012:  0.173, 2013:  0.228, 2014: -0.050,
    2015: -0.003, 2016:  0.010, 2017:  0.253, 2018: -0.138, 2019:  0.222,
    2020:  0.079, 2021:  0.114, 2022: -0.147, 2023:  0.186, 2024:  0.045,
  },
  TLT: {
    2000:  0.203, 2001:  0.042, 2002:  0.176, 2003:  0.021, 2004:  0.089,
    2005: -0.081, 2006:  0.012, 2007:  0.100, 2008:  0.336, 2009: -0.221,
    2010:  0.099, 2011:  0.337, 2012:  0.021, 2013: -0.133, 2014:  0.278,
    2015: -0.018, 2016:  0.013, 2017:  0.086, 2018: -0.022, 2019:  0.145,
    2020:  0.180, 2021: -0.046, 2022: -0.310, 2023: -0.031, 2024:  0.082,
  },
  SHY: {
    2000:  0.062, 2001:  0.079, 2002:  0.098, 2003:  0.015, 2004:  0.011,
    2005:  0.016, 2006:  0.038, 2007:  0.088, 2008:  0.063, 2009:  0.011,
    2010:  0.023, 2011:  0.055, 2012:  0.006, 2013: -0.004, 2014:  0.006,
    2015:  0.004, 2016:  0.006, 2017:  0.008, 2018:  0.016, 2019:  0.034,
    2020:  0.032, 2021: -0.005, 2022: -0.044, 2023:  0.044, 2024:  0.050,
  },
  VBR: {
    2000:  0.220, 2001:  0.145, 2002: -0.143, 2003:  0.460, 2004:  0.228,
    2005:  0.078, 2006:  0.222, 2007: -0.069, 2008: -0.319, 2009:  0.344,
    2010:  0.244, 2011: -0.024, 2012:  0.185, 2013:  0.413, 2014:  0.087,
    2015: -0.041, 2016:  0.252, 2017:  0.147, 2018: -0.124, 2019:  0.229,
    2020:  0.042, 2021:  0.289, 2022: -0.140, 2023:  0.224, 2024:  0.198,
  },
  VXUS: {
    2000: -0.152, 2001: -0.213, 2002: -0.148, 2003:  0.405, 2004:  0.214,
    2005:  0.145, 2006:  0.268, 2007:  0.168, 2008: -0.445, 2009:  0.413,
    2010:  0.112, 2011: -0.137, 2012:  0.186, 2013:  0.155, 2014: -0.036,
    2015: -0.043, 2016:  0.048, 2017:  0.274, 2018: -0.143, 2019:  0.217,
    2020:  0.111, 2021:  0.079, 2022: -0.160, 2023:  0.157, 2024:  0.048,
  },
};

// -------------------------------------------------------
// 2. MONTHLY_RETURNS  –  300 months (Jan 2000 – Dec 2024)
// -------------------------------------------------------
function buildMonthlyReturns(): { month: string; spy: number; blended: number }[] {
  const result: { month: string; spy: number; blended: number }[] = [];
  const annualSPY = ANNUAL_RETURNS.SPY;
  const annualBND = ANNUAL_RETURNS.BND;
  const annualGLD = ANNUAL_RETURNS.GLD;

  // Seasonal multipliers (rough historical bias)
  const seasonalBias = [
    -0.8, -0.2,  0.5,  0.3, -0.1,  0.1,   // Jan–Jun
     0.2,  0.0, -0.3,  0.4,  0.5,  0.5,   // Jul–Dec
  ];

  let spyAccum  = 0;
  let bndAccum  = 0;
  let gldAccum  = 0;
  let yearCount = 0;

  for (let y = 2000; y <= 2024; y++) {
    const spyAnn  = annualSPY[y];
    const bndAnn  = annualBND[y];
    const gldAnn  = annualGLD[y];
    // blended = 60% SPY + 30% BND + 10% GLD
    const blAnn   = spyAnn * 0.60 + bndAnn * 0.30 + gldAnn * 0.10;

    // Distribute annual return across 12 months proportionally + seasonal noise
    const spyMonths  = distributeAnnual(spyAnn, seasonalBias, y);
    const blMonths   = distributeAnnual(blAnn,  seasonalBias, y);

    for (let m = 0; m < 12; m++) {
      const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
      result.push({ month: monthStr, spy: spyMonths[m], blended: blMonths[m] });
    }
    spyAccum += spyAnn; bndAccum += bndAnn; gldAccum += gldAnn; yearCount++;
  }
  return result;
}

function distributeAnnual(annual: number, bias: number[], year: number): number[] {
  // Simple deterministic distribution: equal share + seasonal tilt
  const base     = annual / 12;
  const noise    = annual * 0.04;   // ±4% of annual for intra-year spread
  const months: number[] = [];

  // Use year as seed for deterministic "pseudo-random" tilt
  let seed = year * 7 + 13;
  function rng() {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1;  // [-1, 1]
  }

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const v = parseFloat((base + bias[i] * noise + rng() * noise * 0.5).toFixed(4));
    months.push(v);
    sum += v;
  }
  // Last month closes the annual total exactly
  months.push(parseFloat((annual - sum).toFixed(4)));
  return months;
}

export const MONTHLY_RETURNS = buildMonthlyReturns();

// -------------------------------------------------------
// 3. ASSET_UNIVERSE  –  50 assets
// -------------------------------------------------------
export interface Asset {
  symbol: string;
  name: string;
  type: 'ETF' | 'Stock' | 'Bond';
  price: number;
  change1d: number;
  return1y: number;
  return3y: number;
  return5y: number;
  volatility: number;
  sharpe: number;
  expenseRatio: number;
  aum: number;            // billions USD
  dividendYield: number;
  sector: string;
}

export const ASSET_UNIVERSE: Asset[] = [
  // --- US Equity ETFs ---
  { symbol:'SPY',  name:'SPDR S&P 500 ETF',                type:'ETF',   price:580.00, change1d: 0.74, return1y:23.5, return3y:10.1, return5y:14.2, volatility:14.8, sharpe:0.92, expenseRatio:0.0945, aum:510.0, dividendYield:1.25, sector:'US Equity' },
  { symbol:'QQQ',  name:'Invesco QQQ Trust',               type:'ETF',   price:495.00, change1d: 1.02, return1y:25.3, return3y:11.4, return5y:19.5, volatility:19.2, sharpe:1.05, expenseRatio:0.20,   aum:285.0, dividendYield:0.58, sector:'US Equity' },
  { symbol:'IVV',  name:'iShares Core S&P 500 ETF',        type:'ETF',   price:582.00, change1d: 0.73, return1y:23.4, return3y:10.0, return5y:14.1, volatility:14.7, sharpe:0.91, expenseRatio:0.03,   aum:520.0, dividendYield:1.27, sector:'US Equity' },
  { symbol:'VOO',  name:'Vanguard S&P 500 ETF',            type:'ETF',   price:535.00, change1d: 0.72, return1y:23.3, return3y: 9.9, return5y:14.0, volatility:14.7, sharpe:0.91, expenseRatio:0.03,   aum:450.0, dividendYield:1.28, sector:'US Equity' },
  { symbol:'VTI',  name:'Vanguard Total Stock Market ETF', type:'ETF',   price:268.00, change1d: 0.69, return1y:22.8, return3y: 9.5, return5y:13.7, volatility:15.1, sharpe:0.88, expenseRatio:0.03,   aum:390.0, dividendYield:1.31, sector:'US Equity' },
  { symbol:'IWM',  name:'iShares Russell 2000 ETF',        type:'ETF',   price:215.00, change1d: 0.92, return1y:18.2, return3y: 5.4, return5y: 9.8, volatility:20.2, sharpe:0.62, expenseRatio:0.19,   aum:72.0,  dividendYield:1.15, sector:'US Equity' },
  { symbol:'MDY',  name:'SPDR S&P Midcap 400 ETF',         type:'ETF',   price:574.00, change1d: 0.61, return1y:19.4, return3y: 7.2, return5y:11.5, volatility:17.4, sharpe:0.74, expenseRatio:0.23,   aum:23.5,  dividendYield:1.05, sector:'US Equity' },
  { symbol:'VBR',  name:'Vanguard Small-Cap Value ETF',    type:'ETF',   price:193.00, change1d: 0.85, return1y:19.8, return3y: 8.1, return5y:11.2, volatility:18.9, sharpe:0.72, expenseRatio:0.07,   aum:28.4,  dividendYield:2.05, sector:'US Equity' },
  { symbol:'VBK',  name:'Vanguard Small-Cap Growth ETF',   type:'ETF',   price:244.00, change1d: 1.12, return1y:21.2, return3y: 5.8, return5y:11.8, volatility:22.1, sharpe:0.68, expenseRatio:0.07,   aum:19.8,  dividendYield:0.42, sector:'US Equity' },

  // --- Bond ETFs ---
  { symbol:'BND',  name:'Vanguard Total Bond Market ETF',  type:'Bond',  price: 72.50, change1d: 0.12, return1y: 4.2, return3y:-0.8, return5y: 0.9, volatility: 5.1, sharpe:0.21, expenseRatio:0.03,   aum:110.0, dividendYield:3.38, sector:'Bonds' },
  { symbol:'AGG',  name:'iShares Core US Agg Bond ETF',    type:'Bond',  price: 96.50, change1d: 0.11, return1y: 4.1, return3y:-0.9, return5y: 0.8, volatility: 5.2, sharpe:0.20, expenseRatio:0.03,   aum:115.0, dividendYield:3.42, sector:'Bonds' },
  { symbol:'TLT',  name:'iShares 20+ Year Treas Bond ETF', type:'Bond',  price: 90.00, change1d: 0.24, return1y: 8.2, return3y:-8.2, return5y:-2.1, volatility:14.2, sharpe:0.08, expenseRatio:0.15,   aum: 54.0, dividendYield:4.52, sector:'Bonds' },
  { symbol:'IEF',  name:'iShares 7-10 Year Treasury ETF',  type:'Bond',  price: 92.00, change1d: 0.15, return1y: 5.4, return3y:-3.8, return5y: 0.2, volatility: 7.8, sharpe:0.18, expenseRatio:0.15,   aum: 31.0, dividendYield:3.82, sector:'Bonds' },
  { symbol:'SHY',  name:'iShares 1-3 Year Treasury ETF',   type:'Bond',  price: 81.50, change1d: 0.04, return1y: 5.0, return3y: 1.8, return5y: 1.5, volatility: 1.6, sharpe:0.82, expenseRatio:0.15,   aum: 28.0, dividendYield:4.85, sector:'Bonds' },
  { symbol:'LQD',  name:'iShares iBoxx $ IG Corp Bond ETF',type:'Bond',  price:108.00, change1d: 0.18, return1y: 5.8, return3y:-2.1, return5y: 1.2, volatility: 7.4, sharpe:0.28, expenseRatio:0.14,   aum: 32.0, dividendYield:4.21, sector:'Bonds' },
  { symbol:'HYG',  name:'iShares iBoxx $ HY Corp Bond ETF',type:'Bond',  price: 77.50, change1d: 0.22, return1y: 8.1, return3y: 1.8, return5y: 3.2, volatility: 9.8, sharpe:0.52, expenseRatio:0.48,   aum: 18.0, dividendYield:5.85, sector:'Bonds' },

  // --- International ETFs ---
  { symbol:'EFA',  name:'iShares MSCI EAFE ETF',           type:'ETF',   price: 82.00, change1d: 0.42, return1y: 4.5, return3y: 4.1, return5y: 6.8, volatility:14.9, sharpe:0.38, expenseRatio:0.32,   aum: 58.0, dividendYield:3.12, sector:'International' },
  { symbol:'VEA',  name:'Vanguard FTSE Developed Markets', type:'ETF',   price: 50.50, change1d: 0.41, return1y: 4.4, return3y: 4.0, return5y: 6.7, volatility:14.8, sharpe:0.37, expenseRatio:0.05,   aum: 95.0, dividendYield:3.15, sector:'International' },
  { symbol:'VXUS', name:'Vanguard Total Intl Stock ETF',   type:'ETF',   price: 59.00, change1d: 0.38, return1y: 4.8, return3y: 3.8, return5y: 6.4, volatility:15.2, sharpe:0.35, expenseRatio:0.07,   aum: 67.0, dividendYield:2.98, sector:'International' },
  { symbol:'EEM',  name:'iShares MSCI Emerging Markets',   type:'ETF',   price: 42.50, change1d: 0.58, return1y: 7.2, return3y: 0.4, return5y: 3.1, volatility:18.5, sharpe:0.22, expenseRatio:0.70,   aum: 24.0, dividendYield:2.85, sector:'Emerging Markets' },
  { symbol:'VWO',  name:'Vanguard FTSE Emerging Markets',  type:'ETF',   price: 44.00, change1d: 0.55, return1y: 7.1, return3y: 0.5, return5y: 3.2, volatility:18.2, sharpe:0.24, expenseRatio:0.08,   aum: 72.0, dividendYield:3.08, sector:'Emerging Markets' },

  // --- Sector ETFs ---
  { symbol:'XLK',  name:'Technology Select Sector SPDR',   type:'ETF',   price:238.00, change1d: 1.22, return1y:38.2, return3y:13.8, return5y:23.4, volatility:22.4, sharpe:1.18, expenseRatio:0.10,   aum: 64.0, dividendYield:0.68, sector:'Technology' },
  { symbol:'XLF',  name:'Financial Select Sector SPDR',    type:'ETF',   price: 43.50, change1d: 0.68, return1y:28.4, return3y:10.2, return5y:13.8, volatility:16.8, sharpe:0.88, expenseRatio:0.10,   aum: 38.0, dividendYield:1.85, sector:'Financials' },
  { symbol:'XLE',  name:'Energy Select Sector SPDR',       type:'ETF',   price: 92.00, change1d:-0.32, return1y:10.2, return3y:19.8, return5y:14.5, volatility:24.2, sharpe:0.62, expenseRatio:0.10,   aum: 36.0, dividendYield:3.24, sector:'Energy' },
  { symbol:'XLV',  name:'Health Care Select Sector SPDR',  type:'ETF',   price:149.00, change1d: 0.44, return1y:16.4, return3y: 7.8, return5y:11.2, volatility:13.8, sharpe:0.82, expenseRatio:0.10,   aum: 38.0, dividendYield:1.52, sector:'Healthcare' },
  { symbol:'XLU',  name:'Utilities Select Sector SPDR',    type:'ETF',   price: 71.00, change1d: 0.22, return1y:25.4, return3y: 3.2, return5y: 6.8, volatility:14.2, sharpe:0.68, expenseRatio:0.10,   aum: 15.0, dividendYield:2.94, sector:'Utilities' },
  { symbol:'XLI',  name:'Industrial Select Sector SPDR',   type:'ETF',   price:131.00, change1d: 0.52, return1y:21.8, return3y:10.4, return5y:14.2, volatility:15.8, sharpe:0.88, expenseRatio:0.10,   aum: 18.0, dividendYield:1.38, sector:'Industrials' },
  { symbol:'XLP',  name:'Consumer Staples Select SPDR',    type:'ETF',   price: 78.00, change1d: 0.18, return1y:10.2, return3y: 5.8, return5y: 8.4, volatility:11.2, sharpe:0.72, expenseRatio:0.10,   aum: 14.0, dividendYield:2.58, sector:'Consumer Staples' },
  { symbol:'XLB',  name:'Materials Select Sector SPDR',    type:'ETF',   price: 91.00, change1d: 0.35, return1y:14.8, return3y: 6.2, return5y:11.4, volatility:18.2, sharpe:0.62, expenseRatio:0.10,   aum:  7.5, dividendYield:1.72, sector:'Materials' },
  { symbol:'XLC',  name:'Communication Services Select',   type:'ETF',   price: 90.00, change1d: 0.88, return1y:34.2, return3y: 9.2, return5y:12.8, volatility:20.4, sharpe:0.92, expenseRatio:0.10,   aum: 15.0, dividendYield:0.85, sector:'Communication' },

  // --- Commodities ---
  { symbol:'GLD',  name:'SPDR Gold Shares',                type:'ETF',   price:220.00, change1d: 0.28, return1y:13.1, return3y: 8.4, return5y: 9.8, volatility:13.8, sharpe:0.52, expenseRatio:0.40,   aum: 62.0, dividendYield:0.00, sector:'Commodities' },
  { symbol:'SLV',  name:'iShares Silver Trust',            type:'ETF',   price: 24.00, change1d: 0.42, return1y: 8.4, return3y: 1.2, return5y: 5.8, volatility:22.4, sharpe:0.28, expenseRatio:0.50,   aum:  9.5, dividendYield:0.00, sector:'Commodities' },
  { symbol:'USO',  name:'United States Oil Fund',          type:'ETF',   price: 72.00, change1d:-0.85, return1y: 5.2, return3y:12.8, return5y: 8.2, volatility:38.2, sharpe:0.22, expenseRatio:0.60,   aum:  2.8, dividendYield:0.00, sector:'Commodities' },
  { symbol:'DJP',  name:'iPath Bloomberg Commodity Index', type:'ETF',   price: 28.50, change1d:-0.21, return1y: 4.8, return3y: 6.2, return5y: 5.4, volatility:14.8, sharpe:0.28, expenseRatio:0.70,   aum:  0.9, dividendYield:0.00, sector:'Commodities' },

  // --- Real Estate ---
  { symbol:'VNQ',  name:'Vanguard Real Estate ETF',        type:'ETF',   price: 94.00, change1d: 0.32, return1y:12.4, return3y: 2.1, return5y: 6.8, volatility:18.2, sharpe:0.48, expenseRatio:0.12,   aum: 34.0, dividendYield:3.85, sector:'Real Estate' },
  { symbol:'SCHH', name:'Schwab US REIT ETF',              type:'ETF',   price: 20.50, change1d: 0.31, return1y:12.2, return3y: 2.0, return5y: 6.7, volatility:18.1, sharpe:0.47, expenseRatio:0.07,   aum:  7.5, dividendYield:3.92, sector:'Real Estate' },

  // --- Individual Stocks (US) ---
  { symbol:'AAPL',  name:'Apple Inc.',                     type:'Stock', price:190.00, change1d: 0.84, return1y:18.2, return3y:12.4, return5y:30.2, volatility:24.2, sharpe:1.12, expenseRatio:0,      aum:  0,   dividendYield:0.52, sector:'Technology' },
  { symbol:'MSFT',  name:'Microsoft Corporation',          type:'Stock', price:415.00, change1d: 0.92, return1y:22.4, return3y:16.8, return5y:32.4, volatility:22.8, sharpe:1.24, expenseRatio:0,      aum:  0,   dividendYield:0.72, sector:'Technology' },
  { symbol:'GOOGL', name:'Alphabet Inc.',                  type:'Stock', price:175.00, change1d: 1.24, return1y:32.4, return3y:10.2, return5y:22.8, volatility:26.4, sharpe:1.08, expenseRatio:0,      aum:  0,   dividendYield:0.00, sector:'Technology' },
  { symbol:'AMZN',  name:'Amazon.com Inc.',                type:'Stock', price:195.00, change1d: 1.08, return1y:35.2, return3y: 8.4, return5y:18.4, volatility:28.8, sharpe:1.02, expenseRatio:0,      aum:  0,   dividendYield:0.00, sector:'Consumer Disc.' },
  { symbol:'META',  name:'Meta Platforms Inc.',            type:'Stock', price:590.00, change1d: 1.42, return1y:58.4, return3y:18.2, return5y:24.8, volatility:38.2, sharpe:1.18, expenseRatio:0,      aum:  0,   dividendYield:0.45, sector:'Communication' },
  { symbol:'TSLA',  name:'Tesla Inc.',                     type:'Stock', price:250.00, change1d: 2.24, return1y: 8.4, return3y:-8.2, return5y:28.4, volatility:58.4, sharpe:0.42, expenseRatio:0,      aum:  0,   dividendYield:0.00, sector:'Consumer Disc.' },
  { symbol:'NVDA',  name:'NVIDIA Corporation',             type:'Stock', price:135.00, change1d: 2.84, return1y:162.4,return3y:68.4, return5y:92.8, volatility:58.8, sharpe:2.24, expenseRatio:0,      aum:  0,   dividendYield:0.02, sector:'Technology' },

  // --- Individual Stocks (India) ---
  { symbol:'RELIANCE',name:'Reliance Industries',          type:'Stock', price:2847,   change1d: 0.45, return1y:12.4, return3y:14.8, return5y:18.2, volatility:22.4, sharpe:0.82, expenseRatio:0,      aum:  0,   dividendYield:0.35, sector:'Energy' },
  { symbol:'TCS',     name:'Tata Consultancy Services',    type:'Stock', price:3892,   change1d: 0.62, return1y: 8.4, return3y:10.2, return5y:16.4, volatility:18.2, sharpe:0.72, expenseRatio:0,      aum:  0,   dividendYield:1.82, sector:'IT' },
  { symbol:'INFY',    name:'Infosys Limited',              type:'Stock', price:1845,   change1d: 0.84, return1y:14.2, return3y: 9.8, return5y:14.8, volatility:20.4, sharpe:0.78, expenseRatio:0,      aum:  0,   dividendYield:2.24, sector:'IT' },
];

// -------------------------------------------------------
// 4. LAZY_PORTFOLIOS  –  12 classic portfolios
// -------------------------------------------------------
export interface PortfolioHolding {
  symbol: string;
  weight: number;  // 0-1
}

export interface LazyPortfolio {
  id: string;
  name: string;
  description: string;
  author: string;
  holdings: PortfolioHolding[];
  cagr: number;
  maxDrawdown: number;
  sharpe: number;
  sortino: number;
  volatility: number;
  calmar: number;
  bestYear: number;
  worstYear: number;
  winRate: number;       // % of positive years
  ulcerIndex: number;
  mdd_recovery_months: number;
}

export const LAZY_PORTFOLIOS: LazyPortfolio[] = [
  {
    id: 'three-fund',
    name: 'Three-Fund (Bogle)',
    description: 'Jack Bogle\'s simplest diversified portfolio: US stocks, international stocks, bonds.',
    author: 'Jack Bogle',
    holdings: [
      { symbol:'VTI',  weight:0.60 },
      { symbol:'VXUS', weight:0.20 },
      { symbol:'BND',  weight:0.20 },
    ],
    cagr:9.2, maxDrawdown:-39.0, sharpe:0.72, sortino:1.04, volatility:13.1,
    calmar:0.23, bestYear:2013, worstYear:2008, winRate:68, ulcerIndex:8.2, mdd_recovery_months:48,
  },
  {
    id: 'all-weather',
    name: 'All Weather (Dalio)',
    description: 'Ray Dalio\'s portfolio designed to perform well across all economic environments.',
    author: 'Ray Dalio',
    holdings: [
      { symbol:'VTI', weight:0.30 },
      { symbol:'TLT', weight:0.40 },
      { symbol:'IEF', weight:0.15 },
      { symbol:'GLD', weight:0.075 },
      { symbol:'DJP', weight:0.075 },
    ],
    cagr:7.1, maxDrawdown:-20.0, sharpe:0.81, sortino:1.18, volatility:9.2,
    calmar:0.35, bestYear:2019, worstYear:2022, winRate:72, ulcerIndex:4.8, mdd_recovery_months:28,
  },
  {
    id: 'golden-butterfly',
    name: 'Golden Butterfly',
    description: 'Modification of the Permanent Portfolio with tilt toward small-cap value.',
    author: 'Tyler – Portfolio Charts',
    holdings: [
      { symbol:'VTI', weight:0.20 },
      { symbol:'IJS', weight:0.20 },
      { symbol:'TLT', weight:0.20 },
      { symbol:'SHY', weight:0.20 },
      { symbol:'GLD', weight:0.20 },
    ],
    cagr:8.1, maxDrawdown:-18.0, sharpe:0.88, sortino:1.32, volatility:9.8,
    calmar:0.45, bestYear:2013, worstYear:2022, winRate:76, ulcerIndex:4.2, mdd_recovery_months:22,
  },
  {
    id: 'permanent',
    name: 'Permanent (Browne)',
    description: 'Harry Browne\'s four-quadrant portfolio designed for prosperity, recession, inflation, deflation.',
    author: 'Harry Browne',
    holdings: [
      { symbol:'VTI', weight:0.25 },
      { symbol:'TLT', weight:0.25 },
      { symbol:'GLD', weight:0.25 },
      { symbol:'SHY', weight:0.25 },
    ],
    cagr:6.8, maxDrawdown:-13.0, sharpe:0.82, sortino:1.22, volatility:8.4,
    calmar:0.52, bestYear:2002, worstYear:2015, winRate:80, ulcerIndex:3.2, mdd_recovery_months:18,
  },
  {
    id: 'buffett',
    name: 'Buffett 90/10',
    description: 'Warren Buffett\'s recommended portfolio for most investors: 90% index, 10% short-term bonds.',
    author: 'Warren Buffett',
    holdings: [
      { symbol:'SPY', weight:0.90 },
      { symbol:'SHY', weight:0.10 },
    ],
    cagr:9.8, maxDrawdown:-48.0, sharpe:0.74, sortino:1.08, volatility:14.2,
    calmar:0.20, bestYear:2013, worstYear:2008, winRate:68, ulcerIndex:11.2, mdd_recovery_months:52,
  },
  {
    id: 'classic-60-40',
    name: 'Classic 60/40',
    description: 'The traditional balanced portfolio: 60% stocks, 40% bonds.',
    author: 'Traditional',
    holdings: [
      { symbol:'SPY', weight:0.60 },
      { symbol:'AGG', weight:0.40 },
    ],
    cagr:8.4, maxDrawdown:-30.0, sharpe:0.78, sortino:1.14, volatility:10.8,
    calmar:0.28, bestYear:2013, worstYear:2008, winRate:72, ulcerIndex:6.8, mdd_recovery_months:36,
  },
  {
    id: 'larry',
    name: 'Larry Portfolio',
    description: 'Larry Swedroe\'s portfolio: high expected return factors with low volatility bonds.',
    author: 'Larry Swedroe',
    holdings: [
      { symbol:'VBR', weight:0.15 },
      { symbol:'VEA', weight:0.075 },
      { symbol:'VSS', weight:0.075 },
      { symbol:'IEF', weight:0.70 },
    ],
    cagr:7.3, maxDrawdown:-22.0, sharpe:0.75, sortino:1.08, volatility:10.2,
    calmar:0.33, bestYear:2013, worstYear:2008, winRate:72, ulcerIndex:5.8, mdd_recovery_months:32,
  },
  {
    id: 'desert',
    name: 'Desert Portfolio',
    description: 'Simple two-asset portfolio of total market stocks and gold.',
    author: 'Portfolio Charts',
    holdings: [
      { symbol:'VTI', weight:0.60 },
      { symbol:'GLD', weight:0.40 },
    ],
    cagr:8.2, maxDrawdown:-28.0, sharpe:0.72, sortino:1.05, volatility:12.8,
    calmar:0.29, bestYear:2019, worstYear:2008, winRate:68, ulcerIndex:7.4, mdd_recovery_months:40,
  },
  {
    id: 'coffee-house',
    name: 'Coffee House',
    description: 'Bill Schultheis\' seven-fund diversified portfolio with 40% bonds.',
    author: 'Bill Schultheis',
    holdings: [
      { symbol:'VTI', weight:0.10 },
      { symbol:'VEU', weight:0.10 },
      { symbol:'VBR', weight:0.10 },
      { symbol:'VNQ', weight:0.10 },
      { symbol:'VSS', weight:0.10 },
      { symbol:'BND', weight:0.40 },
      { symbol:'SHY', weight:0.10 },
    ],
    cagr:7.6, maxDrawdown:-24.0, sharpe:0.76, sortino:1.10, volatility:9.8,
    calmar:0.32, bestYear:2013, worstYear:2008, winRate:72, ulcerIndex:5.4, mdd_recovery_months:30,
  },
  {
    id: 'pinwheel',
    name: 'Pinwheel Portfolio',
    description: 'Four equal parts across different asset types for broad diversification.',
    author: 'Portfolio Charts',
    holdings: [
      { symbol:'VTI', weight:0.25 },
      { symbol:'QQQ', weight:0.25 },
      { symbol:'BND', weight:0.25 },
      { symbol:'GLD', weight:0.25 },
    ],
    cagr:8.8, maxDrawdown:-26.0, sharpe:0.82, sortino:1.22, volatility:11.4,
    calmar:0.34, bestYear:2020, worstYear:2022, winRate:72, ulcerIndex:5.8, mdd_recovery_months:30,
  },
  {
    id: 'no-brainer',
    name: 'No-Brainer (Bernstein)',
    description: 'William Bernstein\'s simple four-fund portfolio with equal weighting.',
    author: 'William Bernstein',
    holdings: [
      { symbol:'SPY', weight:0.25 },
      { symbol:'EFA', weight:0.25 },
      { symbol:'IWM', weight:0.25 },
      { symbol:'BND', weight:0.25 },
    ],
    cagr:7.8, maxDrawdown:-32.0, sharpe:0.68, sortino:0.98, volatility:11.8,
    calmar:0.24, bestYear:2003, worstYear:2008, winRate:68, ulcerIndex:7.8, mdd_recovery_months:44,
  },
  {
    id: 'income',
    name: 'Income Portfolio',
    description: 'Dividend-focused portfolio for income generation and capital preservation.',
    author: 'YourDhan',
    holdings: [
      { symbol:'VYM',  weight:0.30 },
      { symbol:'SCHD', weight:0.20 },
      { symbol:'VIGI', weight:0.20 },
      { symbol:'TLT',  weight:0.15 },
      { symbol:'AGG',  weight:0.15 },
    ],
    cagr:8.2, maxDrawdown:-28.0, sharpe:0.78, sortino:1.12, volatility:10.4,
    calmar:0.29, bestYear:2021, worstYear:2022, winRate:72, ulcerIndex:6.2, mdd_recovery_months:34,
  },
];

// -------------------------------------------------------
// 5. CORRELATION_MATRIX  –  8×8
// -------------------------------------------------------
export const CORRELATION_LABELS = ['SPY','QQQ','BND','GLD','VNQ','EFA','TLT','VXUS'];

export const CORRELATION_MATRIX: number[][] = [
  //SPY   QQQ    BND    GLD    VNQ    EFA    TLT    VXUS
  [ 1.00,  0.87, -0.02,  0.05,  0.71,  0.86, -0.18,  0.86 ], // SPY
  [ 0.87,  1.00, -0.08,  0.02,  0.58,  0.78, -0.22,  0.78 ], // QQQ
  [-0.02, -0.08,  1.00,  0.12, -0.01,  0.02,  0.82,  0.02 ], // BND
  [ 0.05,  0.02,  0.12,  1.00,  0.08,  0.08,  0.18,  0.08 ], // GLD
  [ 0.71,  0.58, -0.01,  0.08,  1.00,  0.62, -0.08,  0.62 ], // VNQ
  [ 0.86,  0.78,  0.02,  0.08,  0.62,  1.00, -0.12,  0.96 ], // EFA
  [-0.18, -0.22,  0.82,  0.18, -0.08, -0.12,  1.00, -0.12 ], // TLT
  [ 0.86,  0.78,  0.02,  0.08,  0.62,  0.96, -0.12,  1.00 ], // VXUS
];

// -------------------------------------------------------
// 6. FACTOR_DATA  –  per portfolio
// -------------------------------------------------------
export interface FactorData {
  alpha: number;
  beta: number;
  rSquared: number;
  trackingError: number;
  informationRatio: number;
  treynorRatio: number;
  jensenAlpha: number;
  upCapture: number;
  downCapture: number;
}

export const FACTOR_DATA: Record<string, FactorData> = {
  'three-fund':     { alpha:0.012, beta:0.95, rSquared:0.94, trackingError:0.042, informationRatio:0.28, treynorRatio:0.082, jensenAlpha:0.008, upCapture:0.92, downCapture:0.88 },
  'all-weather':    { alpha:0.008, beta:0.52, rSquared:0.72, trackingError:0.068, informationRatio:0.22, treynorRatio:0.068, jensenAlpha:0.004, upCapture:0.58, downCapture:0.42 },
  'golden-butterfly':{ alpha:0.018, beta:0.58, rSquared:0.78, trackingError:0.058, informationRatio:0.34, treynorRatio:0.088, jensenAlpha:0.012, upCapture:0.62, downCapture:0.40 },
  'permanent':      { alpha:0.008, beta:0.45, rSquared:0.65, trackingError:0.072, informationRatio:0.18, treynorRatio:0.058, jensenAlpha:0.004, upCapture:0.52, downCapture:0.35 },
  'buffett':        { alpha:0.014, beta:0.92, rSquared:0.98, trackingError:0.022, informationRatio:0.32, treynorRatio:0.078, jensenAlpha:0.010, upCapture:0.94, downCapture:0.92 },
  'classic-60-40':  { alpha:0.010, beta:0.65, rSquared:0.88, trackingError:0.048, informationRatio:0.24, treynorRatio:0.072, jensenAlpha:0.006, upCapture:0.68, downCapture:0.55 },
  'larry':          { alpha:0.014, beta:0.42, rSquared:0.68, trackingError:0.075, informationRatio:0.26, treynorRatio:0.072, jensenAlpha:0.008, upCapture:0.48, downCapture:0.32 },
  'desert':         { alpha:0.012, beta:0.68, rSquared:0.82, trackingError:0.055, informationRatio:0.28, treynorRatio:0.075, jensenAlpha:0.008, upCapture:0.72, downCapture:0.58 },
  'coffee-house':   { alpha:0.011, beta:0.60, rSquared:0.82, trackingError:0.058, informationRatio:0.24, treynorRatio:0.072, jensenAlpha:0.007, upCapture:0.65, downCapture:0.50 },
  'pinwheel':       { alpha:0.014, beta:0.72, rSquared:0.88, trackingError:0.048, informationRatio:0.30, treynorRatio:0.078, jensenAlpha:0.010, upCapture:0.75, downCapture:0.58 },
  'no-brainer':     { alpha:0.008, beta:0.78, rSquared:0.90, trackingError:0.052, informationRatio:0.20, treynorRatio:0.065, jensenAlpha:0.005, upCapture:0.80, downCapture:0.72 },
  'income':         { alpha:0.010, beta:0.62, rSquared:0.84, trackingError:0.055, informationRatio:0.22, treynorRatio:0.072, jensenAlpha:0.006, upCapture:0.67, downCapture:0.52 },
};
