// ============================================================
// YourDhan – Mock NSE Stock Data  (20 stocks, 10yr financials)
// ============================================================

// -------------------------------------------------------
// Interfaces
// -------------------------------------------------------
export interface AnnualFinancials {
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingIncome: number;
  ebitda: number;
  netIncome: number;
  eps: number;
  freeCashFlow: number;
  operatingCashFlow: number;
  capex: number;
  totalAssets: number;
  currentAssets: number;
  cash: number;
  inventory: number;
  receivables: number;
  ppe: number;
  totalLiabilities: number;
  currentLiabilities: number;
  longTermDebt: number;
  totalDebt: number;
  totalEquity: number;
  retainedEarnings: number;
  sharesOutstanding: number;
  depreciation: number;
  interestExpense: number;
  incomeTaxExpense: number;
  pretaxIncome: number;
  sga: number;
  dividendPerShare: number;
  bookValuePerShare: number;
}

export interface PriceHistory {
  date: string;
  close: number;
  volume: number;
}

export interface StockMockData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  exchange: 'NSE' | 'BSE';
  currentPrice: number;
  previousClose: number;
  marketCap: number;
  beta: number;
  analystEPS_year1: number;
  analystRevenue_year1: number;
  consecutiveDividendGrowthYears: number;
  insiderBuys_90d: number;
  insiderSells_90d: number;
  sharesBought_90d: number;
  sharesSold_90d: number;
  netSharesSold_12m: number;
  gurusAdded_quarter: number;
  description: string;
  website: string;
  financials: AnnualFinancials[];
  priceHistory: PriceHistory[];
}

// -------------------------------------------------------
// Deterministic PRNG helpers
// -------------------------------------------------------
function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return h;
}

function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// -------------------------------------------------------
// Price history generator (120 months, deterministic GBM)
// -------------------------------------------------------
function genPriceHistory(ticker: string, currentPrice: number, betaVal: number): PriceHistory[] {
  const rng   = lcg(hashStr(ticker + 'price'));
  const annualReturn = 0.12 + (rng() - 0.5) * 0.06;   // 9-15% annual drift
  const annualVol    = 0.22 + betaVal * 0.08;
  const monthlyRet   = annualReturn / 12;
  const monthlyVol   = annualVol / Math.sqrt(12);

  // Work backwards from current price
  const closes: number[] = [currentPrice];
  for (let i = 1; i < 120; i++) {
    const prev = closes[closes.length - 1];
    const shock = (rng() - 0.5) * 2 * monthlyVol;
    closes.push(prev / (1 + monthlyRet + shock));
  }
  closes.reverse();

  const result: PriceHistory[] = [];
  const startDate = new Date(2015, 0, 1);
  for (let i = 0; i < 120; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const close = parseFloat(closes[i].toFixed(2));
    const baseVol = Math.round(close * 500000 + rng() * 2000000);
    result.push({
      date: d.toISOString().slice(0, 10),
      close,
      volume: Math.max(100000, Math.abs(baseVol)),
    });
  }
  return result;
}

// -------------------------------------------------------
// Financial generator
// -------------------------------------------------------
interface StockProfile {
  ticker: string;
  baseRevenue: number;     // FY2015 revenue in crores
  revenueGrowth: number;   // avg annual revenue CAGR
  grossMargin: number;     // fraction
  opMargin: number;
  netMargin: number;
  debtToEquity: number;
  shares: number;          // crores
  dividendPayoutRatio: number;
  sector: string;
}

function genFinancials(p: StockProfile, currentPrice: number): AnnualFinancials[] {
  const rng = lcg(hashStr(p.ticker + 'fin'));
  const result: AnnualFinancials[] = [];
  let equity = p.baseRevenue * 0.8;

  for (let y = 2015; y <= 2024; y++) {
    const yr = y - 2015;
    const growthNoise = 1 + p.revenueGrowth + (rng() - 0.5) * 0.06;
    const rev = parseFloat((p.baseRevenue * Math.pow(1 + p.revenueGrowth, yr) * (1 + (rng()-0.5)*0.04)).toFixed(0));
    const grossProfit  = parseFloat((rev * (p.grossMargin + (rng()-0.5)*0.02)).toFixed(0));
    const cogs         = rev - grossProfit;
    const sga          = parseFloat((rev * 0.08 * (1 + (rng()-0.5)*0.1)).toFixed(0));
    const opIncome     = parseFloat((rev * (p.opMargin + (rng()-0.5)*0.02)).toFixed(0));
    const depreciation = parseFloat((rev * 0.04 * (1 + (rng()-0.5)*0.1)).toFixed(0));
    const ebitda       = opIncome + depreciation;
    const interestExp  = parseFloat((equity * p.debtToEquity * 0.06).toFixed(0));
    const pretaxIncome = opIncome - interestExp;
    const tax          = parseFloat((pretaxIncome * 0.25).toFixed(0));
    const netIncome    = pretaxIncome - tax;
    const eps          = parseFloat((netIncome / p.shares).toFixed(2));
    const dividendPS   = parseFloat((eps * p.dividendPayoutRatio).toFixed(2));
    const capex        = parseFloat((rev * 0.06 * (1 + (rng()-0.5)*0.15)).toFixed(0));
    const opCF         = netIncome + depreciation + parseFloat((rev * 0.02 * (rng()-0.5)).toFixed(0));
    const fcf          = opCF - capex;

    const totalAssets   = parseFloat((rev * 1.4 + equity).toFixed(0));
    const currentAssets = parseFloat((totalAssets * 0.35).toFixed(0));
    const cash          = parseFloat((currentAssets * 0.30).toFixed(0));
    const inventory     = p.sector === 'Auto' || p.sector === 'FMCG'
                            ? parseFloat((currentAssets * 0.20).toFixed(0)) : parseFloat((currentAssets * 0.10).toFixed(0));
    const receivables   = parseFloat((currentAssets * 0.30).toFixed(0));
    const ppe           = parseFloat((totalAssets * 0.40).toFixed(0));
    const longTermDebt  = parseFloat((equity * p.debtToEquity * 0.70).toFixed(0));
    const totalDebt     = parseFloat((equity * p.debtToEquity).toFixed(0));
    const currentLiab   = parseFloat((totalAssets * 0.22).toFixed(0));
    const totalLiab     = parseFloat((totalAssets - equity).toFixed(0));
    const retainedEarnings = parseFloat((equity * 0.55).toFixed(0));
    const bookValue     = parseFloat((equity / p.shares).toFixed(2));

    equity += netIncome - dividendPS * p.shares;

    result.push({
      year: y,
      revenue: rev,
      cogs,
      grossProfit,
      operatingIncome: opIncome,
      ebitda,
      netIncome,
      eps,
      freeCashFlow: fcf,
      operatingCashFlow: opCF,
      capex,
      totalAssets,
      currentAssets,
      cash,
      inventory,
      receivables,
      ppe,
      totalLiabilities: totalLiab,
      currentLiabilities: currentLiab,
      longTermDebt,
      totalDebt,
      totalEquity: Math.round(equity),
      retainedEarnings,
      sharesOutstanding: p.shares,
      depreciation,
      interestExpense: interestExp,
      incomeTaxExpense: tax,
      pretaxIncome,
      sga,
      dividendPerShare: dividendPS,
      bookValuePerShare: bookValue,
    });
  }
  return result;
}

// -------------------------------------------------------
// Stock profiles
// -------------------------------------------------------
interface FullStockDef {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  currentPrice: number;
  marketCapCr: number;   // crores
  beta: number;
  analystEPS: number;
  analystRev: number;
  divGrowthYrs: number;
  insiderBuys: number;
  insiderSells: number;
  sharesBought: number;
  sharesSold: number;
  netSharesSold: number;
  gurusAdded: number;
  description: string;
  website: string;
  profile: StockProfile;
}

const STOCK_DEFS: FullStockDef[] = [
  {
    ticker:'RELIANCE', name:'Reliance Industries Ltd', sector:'Energy',
    industry:'Oil, Gas & Diversified', currentPrice:2847, marketCapCr:1924000,
    beta:1.05, analystEPS:96.4, analystRev:980000,
    divGrowthYrs:12, insiderBuys:3, insiderSells:1, sharesBought:1200000, sharesSold:400000, netSharesSold:5000000, gurusAdded:8,
    description:'India\'s largest private sector corporation, engaged in hydrocarbons, petrochemicals, retail, and telecom (Jio).',
    website:'https://www.ril.com',
    profile:{ ticker:'RELIANCE', baseRevenue:370000, revenueGrowth:0.10, grossMargin:0.21, opMargin:0.13, netMargin:0.08, debtToEquity:0.65, shares:6765, dividendPayoutRatio:0.09, sector:'Energy' },
  },
  {
    ticker:'TCS', name:'Tata Consultancy Services Ltd', sector:'IT',
    industry:'IT Services & Consulting', currentPrice:3892, marketCapCr:1418000,
    beta:0.72, analystEPS:118.2, analystRev:252000,
    divGrowthYrs:20, insiderBuys:0, insiderSells:2, sharesBought:0, sharesSold:800000, netSharesSold:1500000, gurusAdded:12,
    description:'Global leader in IT services, digital and business solutions, part of the Tata Group.',
    website:'https://www.tcs.com',
    profile:{ ticker:'TCS', baseRevenue:108000, revenueGrowth:0.11, grossMargin:0.37, opMargin:0.26, netMargin:0.20, debtToEquity:0.02, shares:3640, dividendPayoutRatio:0.45, sector:'IT' },
  },
  {
    ticker:'HDFCBANK', name:'HDFC Bank Ltd', sector:'Financials',
    industry:'Private Sector Banking', currentPrice:1623, marketCapCr:1238000,
    beta:0.88, analystEPS:88.4, analystRev:280000,
    divGrowthYrs:18, insiderBuys:2, insiderSells:1, sharesBought:600000, sharesSold:200000, netSharesSold:1200000, gurusAdded:15,
    description:'India\'s largest private sector bank by assets, offering a wide range of banking products and financial services.',
    website:'https://www.hdfcbank.com',
    profile:{ ticker:'HDFCBANK', baseRevenue:82000, revenueGrowth:0.16, grossMargin:0.58, opMargin:0.35, netMargin:0.24, debtToEquity:7.20, shares:7620, dividendPayoutRatio:0.20, sector:'Financials' },
  },
  {
    ticker:'INFY', name:'Infosys Ltd', sector:'IT',
    industry:'IT Services & Consulting', currentPrice:1845, marketCapCr:774000,
    beta:0.78, analystEPS:62.8, analystRev:158000,
    divGrowthYrs:22, insiderBuys:1, insiderSells:3, sharesBought:400000, sharesSold:1200000, netSharesSold:2000000, gurusAdded:10,
    description:'Global IT services and consulting company, delivering digital transformation for clients in 50+ countries.',
    website:'https://www.infosys.com',
    profile:{ ticker:'INFY', baseRevenue:62000, revenueGrowth:0.09, grossMargin:0.33, opMargin:0.22, netMargin:0.17, debtToEquity:0.05, shares:4200, dividendPayoutRatio:0.55, sector:'IT' },
  },
  {
    ticker:'ICICIBANK', name:'ICICI Bank Ltd', sector:'Financials',
    industry:'Private Sector Banking', currentPrice:1285, marketCapCr:906000,
    beta:1.18, analystEPS:72.4, analystRev:210000,
    divGrowthYrs:14, insiderBuys:4, insiderSells:0, sharesBought:1800000, sharesSold:0, netSharesSold:-800000, gurusAdded:14,
    description:'India\'s second largest private sector bank, offering banking, insurance, and financial services.',
    website:'https://www.icicibank.com',
    profile:{ ticker:'ICICIBANK', baseRevenue:58000, revenueGrowth:0.18, grossMargin:0.62, opMargin:0.38, netMargin:0.28, debtToEquity:8.50, shares:7050, dividendPayoutRatio:0.18, sector:'Financials' },
  },
  {
    ticker:'SBIN', name:'State Bank of India', sector:'Financials',
    industry:'Public Sector Banking', currentPrice:845, marketCapCr:754000,
    beta:1.32, analystEPS:72.8, analystRev:450000,
    divGrowthYrs:8, insiderBuys:0, insiderSells:0, sharesBought:0, sharesSold:0, netSharesSold:500000, gurusAdded:6,
    description:'India\'s largest public sector bank and a Fortune 500 company, with over 22,000 branches nationwide.',
    website:'https://www.sbi.co.in',
    profile:{ ticker:'SBIN', baseRevenue:185000, revenueGrowth:0.12, grossMargin:0.48, opMargin:0.28, netMargin:0.18, debtToEquity:11.20, shares:8920, dividendPayoutRatio:0.25, sector:'Financials' },
  },
  {
    ticker:'LT', name:'Larsen & Toubro Ltd', sector:'Construction',
    industry:'Infrastructure & Engineering', currentPrice:3624, marketCapCr:508000,
    beta:1.14, analystEPS:118.4, analystRev:248000,
    divGrowthYrs:15, insiderBuys:2, insiderSells:1, sharesBought:500000, sharesSold:200000, netSharesSold:800000, gurusAdded:9,
    description:'India\'s largest engineering, procurement, construction and project management conglomerate.',
    website:'https://www.larsentoubro.com',
    profile:{ ticker:'LT', baseRevenue:108000, revenueGrowth:0.13, grossMargin:0.24, opMargin:0.13, netMargin:0.08, debtToEquity:1.20, shares:1402, dividendPayoutRatio:0.35, sector:'Construction' },
  },
  {
    ticker:'AXISBANK', name:'Axis Bank Ltd', sector:'Financials',
    industry:'Private Sector Banking', currentPrice:1195, marketCapCr:368000,
    beta:1.22, analystEPS:62.4, analystRev:148000,
    divGrowthYrs:10, insiderBuys:3, insiderSells:1, sharesBought:900000, sharesSold:300000, netSharesSold:600000, gurusAdded:8,
    description:'Third largest private sector bank in India, offering a full suite of financial products and services.',
    website:'https://www.axisbank.com',
    profile:{ ticker:'AXISBANK', baseRevenue:48000, revenueGrowth:0.17, grossMargin:0.55, opMargin:0.32, netMargin:0.22, debtToEquity:9.80, shares:3082, dividendPayoutRatio:0.12, sector:'Financials' },
  },
  {
    ticker:'MARUTI', name:'Maruti Suzuki India Ltd', sector:'Auto',
    industry:'Passenger Vehicles', currentPrice:12450, marketCapCr:376000,
    beta:0.92, analystEPS:482.4, analystRev:148000,
    divGrowthYrs:16, insiderBuys:1, insiderSells:0, sharesBought:200000, sharesSold:0, netSharesSold:300000, gurusAdded:7,
    description:'India\'s largest passenger vehicle manufacturer, with a market share exceeding 40%.',
    website:'https://www.marutisuzuki.com',
    profile:{ ticker:'MARUTI', baseRevenue:70000, revenueGrowth:0.09, grossMargin:0.28, opMargin:0.11, netMargin:0.07, debtToEquity:0.08, shares:302, dividendPayoutRatio:0.40, sector:'Auto' },
  },
  {
    ticker:'SUNPHARMA', name:'Sun Pharmaceutical Industries', sector:'Pharma',
    industry:'Pharmaceuticals', currentPrice:1642, marketCapCr:394000,
    beta:0.68, analystEPS:52.4, analystRev:52000,
    divGrowthYrs:12, insiderBuys:2, insiderSells:0, sharesBought:800000, sharesSold:0, netSharesSold:200000, gurusAdded:8,
    description:'India\'s largest pharma company and the world\'s fourth-largest specialty generic pharmaceuticals company.',
    website:'https://www.sunpharma.com',
    profile:{ ticker:'SUNPHARMA', baseRevenue:22800, revenueGrowth:0.12, grossMargin:0.65, opMargin:0.22, netMargin:0.16, debtToEquity:0.12, shares:2400, dividendPayoutRatio:0.28, sector:'Pharma' },
  },
  {
    ticker:'BAJFINANCE', name:'Bajaj Finance Ltd', sector:'Financials',
    industry:'Non-Banking Financial', currentPrice:8245, marketCapCr:510000,
    beta:1.38, analystEPS:282.4, analystRev:58000,
    divGrowthYrs:14, insiderBuys:2, insiderSells:1, sharesBought:400000, sharesSold:150000, netSharesSold:600000, gurusAdded:11,
    description:'India\'s largest non-banking financial company by assets, known for consumer and SME lending.',
    website:'https://www.bajajfinserv.in',
    profile:{ ticker:'BAJFINANCE', baseRevenue:14200, revenueGrowth:0.28, grossMargin:0.68, opMargin:0.42, netMargin:0.30, debtToEquity:6.20, shares:618, dividendPayoutRatio:0.15, sector:'Financials' },
  },
  {
    ticker:'HCLTECH', name:'HCL Technologies Ltd', sector:'IT',
    industry:'IT Services & Consulting', currentPrice:1825, marketCapCr:496000,
    beta:0.74, analystEPS:64.8, analystRev:115000,
    divGrowthYrs:18, insiderBuys:0, insiderSells:2, sharesBought:0, sharesSold:600000, netSharesSold:1000000, gurusAdded:9,
    description:'Global technology company that provides IT and business services, engineering, and R&D services.',
    website:'https://www.hcltech.com',
    profile:{ ticker:'HCLTECH', baseRevenue:48000, revenueGrowth:0.13, grossMargin:0.30, opMargin:0.20, netMargin:0.15, debtToEquity:0.04, shares:2718, dividendPayoutRatio:0.60, sector:'IT' },
  },
  {
    ticker:'WIPRO', name:'Wipro Ltd', sector:'IT',
    industry:'IT Services & Consulting', currentPrice:558, marketCapCr:294000,
    beta:0.72, analystEPS:22.4, analystRev:90000,
    divGrowthYrs:20, insiderBuys:0, insiderSells:5, sharesBought:0, sharesSold:2000000, netSharesSold:3500000, gurusAdded:7,
    description:'Global IT, consulting, and business process services company headquartered in Bangalore.',
    website:'https://www.wipro.com',
    profile:{ ticker:'WIPRO', baseRevenue:48200, revenueGrowth:0.08, grossMargin:0.28, opMargin:0.18, netMargin:0.14, debtToEquity:0.08, shares:5270, dividendPayoutRatio:0.18, sector:'IT' },
  },
  {
    ticker:'TITAN', name:'Titan Company Ltd', sector:'Consumer',
    industry:'Jewellery & Watches', currentPrice:3640, marketCapCr:323000,
    beta:0.88, analystEPS:42.8, analystRev:62000,
    divGrowthYrs:22, insiderBuys:1, insiderSells:0, sharesBought:300000, sharesSold:0, netSharesSold:200000, gurusAdded:10,
    description:'India\'s leading lifestyle company in jewellery, watches, eyewear, and fragrances, part of the Tata Group.',
    website:'https://www.titancompany.in',
    profile:{ ticker:'TITAN', baseRevenue:14200, revenueGrowth:0.18, grossMargin:0.24, opMargin:0.11, netMargin:0.08, debtToEquity:0.15, shares:888, dividendPayoutRatio:0.30, sector:'Consumer' },
  },
  {
    ticker:'ITC', name:'ITC Ltd', sector:'FMCG',
    industry:'Tobacco & FMCG', currentPrice:472, marketCapCr:590000,
    beta:0.62, analystEPS:18.4, analystRev:78000,
    divGrowthYrs:25, insiderBuys:0, insiderSells:1, sharesBought:0, sharesSold:500000, netSharesSold:800000, gurusAdded:13,
    description:'Indian conglomerate with leading positions in tobacco, FMCG, hotels, agribusiness, and information technology.',
    website:'https://www.itcportal.com',
    profile:{ ticker:'ITC', baseRevenue:42000, revenueGrowth:0.07, grossMargin:0.55, opMargin:0.32, netMargin:0.24, debtToEquity:0.02, shares:12500, dividendPayoutRatio:0.85, sector:'FMCG' },
  },
  {
    ticker:'HINDUNILVR', name:'Hindustan Unilever Ltd', sector:'FMCG',
    industry:'Personal & Household Products', currentPrice:2385, marketCapCr:560000,
    beta:0.54, analystEPS:48.2, analystRev:62000,
    divGrowthYrs:30, insiderBuys:0, insiderSells:1, sharesBought:0, sharesSold:300000, netSharesSold:600000, gurusAdded:14,
    description:'India\'s largest FMCG company, part of the global Unilever group, with over 50 leading brands.',
    website:'https://www.hul.co.in',
    profile:{ ticker:'HINDUNILVR', baseRevenue:32000, revenueGrowth:0.08, grossMargin:0.48, opMargin:0.24, netMargin:0.17, debtToEquity:0.05, shares:2350, dividendPayoutRatio:0.90, sector:'FMCG' },
  },
  {
    ticker:'ADANIENT', name:'Adani Enterprises Ltd', sector:'Diversified',
    industry:'Integrated Resources', currentPrice:3185, marketCapCr:362000,
    beta:1.52, analystEPS:48.4, analystRev:98000,
    divGrowthYrs:5, insiderBuys:5, insiderSells:0, sharesBought:2000000, sharesSold:0, netSharesSold:-1000000, gurusAdded:4,
    description:'Flagship company of the Adani Group, with presence in airports, roads, solar manufacturing, and resources.',
    website:'https://www.adanienterprises.com',
    profile:{ ticker:'ADANIENT', baseRevenue:38000, revenueGrowth:0.22, grossMargin:0.22, opMargin:0.10, netMargin:0.06, debtToEquity:1.80, shares:1138, dividendPayoutRatio:0.10, sector:'Diversified' },
  },
  {
    ticker:'TATAMOTORS', name:'Tata Motors Ltd', sector:'Auto',
    industry:'Commercial & Passenger Vehicles', currentPrice:1025, marketCapCr:380000,
    beta:1.42, analystEPS:48.4, analystRev:448000,
    divGrowthYrs:4, insiderBuys:2, insiderSells:1, sharesBought:800000, sharesSold:200000, netSharesSold:1000000, gurusAdded:7,
    description:'India\'s largest automobile company and owner of Jaguar Land Rover, with global manufacturing presence.',
    website:'https://www.tatamotors.com',
    profile:{ ticker:'TATAMOTORS', baseRevenue:265000, revenueGrowth:0.15, grossMargin:0.16, opMargin:0.08, netMargin:0.05, debtToEquity:1.45, shares:3708, dividendPayoutRatio:0.12, sector:'Auto' },
  },
  {
    ticker:'BHARTIARTL', name:'Bharti Airtel Ltd', sector:'Telecom',
    industry:'Mobile Telecommunications', currentPrice:1695, marketCapCr:1010000,
    beta:0.84, analystEPS:42.8, analystRev:148000,
    divGrowthYrs:8, insiderBuys:3, insiderSells:0, sharesBought:1200000, sharesSold:0, netSharesSold:200000, gurusAdded:10,
    description:'India\'s premier telecom company with operations in 18 countries, offering mobile, broadband, and DTH services.',
    website:'https://www.airtel.in',
    profile:{ ticker:'BHARTIARTL', baseRevenue:60000, revenueGrowth:0.16, grossMargin:0.52, opMargin:0.22, netMargin:0.08, debtToEquity:2.20, shares:5958, dividendPayoutRatio:0.25, sector:'Telecom' },
  },
  {
    ticker:'NESTLEIND', name:'Nestle India Ltd', sector:'FMCG',
    industry:'Packaged Foods & Beverages', currentPrice:24850, marketCapCr:239000,
    beta:0.48, analystEPS:348.4, analystRev:22000,
    divGrowthYrs:28, insiderBuys:0, insiderSells:0, sharesBought:0, sharesSold:0, netSharesSold:100000, gurusAdded:11,
    description:'Subsidiary of Nestle S.A., India\'s leading food and beverage company with iconic brands like Maggi and KitKat.',
    website:'https://www.nestle.in',
    profile:{ ticker:'NESTLEIND', baseRevenue:9800, revenueGrowth:0.11, grossMargin:0.52, opMargin:0.22, netMargin:0.16, debtToEquity:0.02, shares:96.4, dividendPayoutRatio:0.92, sector:'FMCG' },
  },
];

// -------------------------------------------------------
// Build the final mock data array
// -------------------------------------------------------
export const MOCK_STOCKS: StockMockData[] = STOCK_DEFS.map(d => {
  const rng = lcg(hashStr(d.ticker));
  const prevClose = parseFloat((d.currentPrice * (1 - 0.015 + rng() * 0.03)).toFixed(2));
  return {
    ticker: d.ticker,
    name: d.name,
    sector: d.sector,
    industry: d.industry,
    exchange: 'NSE',
    currentPrice: d.currentPrice,
    previousClose: prevClose,
    marketCap: d.marketCapCr,
    beta: d.beta,
    analystEPS_year1: d.analystEPS,
    analystRevenue_year1: d.analystRev,
    consecutiveDividendGrowthYears: d.divGrowthYrs,
    insiderBuys_90d: d.insiderBuys,
    insiderSells_90d: d.insiderSells,
    sharesBought_90d: d.sharesBought,
    sharesSold_90d: d.sharesSold,
    netSharesSold_12m: d.netSharesSold,
    gurusAdded_quarter: d.gurusAdded,
    description: d.description,
    website: d.website,
    financials: genFinancials(d.profile, d.currentPrice),
    priceHistory: genPriceHistory(d.ticker, d.currentPrice, d.beta),
  };
});
