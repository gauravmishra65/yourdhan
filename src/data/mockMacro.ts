// ============================================================
// YourDhan – Macro, Indices, News, Calendar, Gurus
// ============================================================

// -------------------------------------------------------
// 1. MACRO – high-level market indicators
// -------------------------------------------------------
export const MACRO = {
  indiaNifty50MarketCap: 32_000_000,   // crores INR
  indiaGDP: 18_500_000,                // crores INR (≈ USD 2.2 T)
  buffettIndicator: 172.9,             // %
  riskFreeRate: 0.072,                 // 10-yr India Gsec yield
  equityRiskPremium: 0.055,
  shillerCAPE: 24.8,
  shillerHistoricalMean: 19.2,
  cpi_current: 182.4,
  cpi_yoy: 0.049,                      // 4.9% YoY
  wpi_current: 168.2,
  wpi_yoy: 0.031,
  repoRate: 0.065,                     // RBI repo rate
  reverseRepoRate: 0.035,
  crr: 0.045,
  slr: 0.185,
  usd_inr: 83.45,
  gbp_inr: 105.8,
  eur_inr: 90.2,
  crude_brent: 84.5,                   // USD per barrel
  gold_oz_usd: 2048,
  india10yrYield: 0.0718,
  us10yrYield: 0.0448,
  fedFundsRate: 0.053,
  m2_india_growth: 0.088,
  fii_net_buy_ytd: 48200,              // crores INR
  dii_net_buy_ytd: 62400,
  nse_pe: 22.4,
  nse_pb: 3.82,
  nse_div_yield: 0.0138,
};

// -------------------------------------------------------
// 2. INDICES – live snapshot
// -------------------------------------------------------
export interface IndexSnapshot {
  value: number;
  change: number;
  changePct: number;
  high52w: number;
  low52w: number;
}

export const INDICES: Record<string, IndexSnapshot> = {
  'NIFTY 50':    { value:24857, change:  183.25, changePct: 0.74, high52w:26277, low52w:19250 },
  'SENSEX':      { value:81523, change:  523.45, changePct: 0.65, high52w:85978, low52w:63148 },
  'NIFTY BANK':  { value:53214, change: -124.30, changePct:-0.23, high52w:54467, low52w:43650 },
  'NIFTY IT':    { value:38456, change:  412.10, changePct: 1.08, high52w:40392, low52w:30256 },
  'INDIA VIX':   { value:12.34, change:   -0.82, changePct:-6.23, high52w:23.51, low52w:10.12 },
  'NIFTY MID':   { value:51234, change:  234.50, changePct: 0.46, high52w:53285, low52w:38145 },
  'NIFTY SMALL': { value:18245, change:  142.30, changePct: 0.79, high52w:19245, low52w:13485 },
  'NIFTY FMCG':  { value:55842, change:   88.40, changePct: 0.16, high52w:58452, low52w:48320 },
  'NIFTY AUTO':  { value:22456, change:  184.20, changePct: 0.83, high52w:23814, low52w:16248 },
  'NIFTY PHARMA':{ value:19845, change:  218.40, changePct: 1.11, high52w:21245, low52w:14850 },
  'S&P 500':     { value: 5845, change:   28.42, changePct: 0.49, high52w: 5878, low52w: 4607 },
  'NASDAQ':      { value:18420, change:  142.8,  changePct: 0.78, high52w:18847, low52w:14477 },
  'DOW JONES':   { value:43250, change:  182.4,  changePct: 0.42, high52w:45054, low52w:37160 },
  'HANG SENG':   { value:17845, change: -182.4,  changePct:-1.01, high52w:22700, low52w:14598 },
  'NIKKEI 225':  { value:39248, change:  248.5,  changePct: 0.64, high52w:42224, low52w:32315 },
};

// -------------------------------------------------------
// 3. MACRO_INDICATORS – 20 indicators × 24 months history
// -------------------------------------------------------
export interface MacroIndicator {
  id: string;
  label: string;
  category: string;
  unit: string;
  currentValue: number;
  prevValue: number;
  change: number;
  changePct: number;
  history: { month: string; value: number }[];
  significance: 'high' | 'medium' | 'low';
  direction: 'up' | 'down' | 'neutral';
  description: string;
}

function genHistory(start: number, drift: number, volatility: number, months: number): { month: string; value: number }[] {
  const result: { month: string; value: number }[] = [];
  let val = start;
  const now = new Date(2025, 3, 1); // April 2025
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    // deterministic noise from month index
    const noise = Math.sin(i * 2.718) * volatility;
    val = val * (1 + drift / 12) + noise;
    result.push({ month: d.toISOString().slice(0, 7), value: parseFloat(val.toFixed(2)) });
  }
  return result;
}

export const MACRO_INDICATORS: MacroIndicator[] = [
  {
    id:'cpi', label:'Consumer Price Index (YoY %)', category:'Inflation',
    unit:'%', currentValue:4.9, prevValue:5.1, change:-0.2, changePct:-3.9,
    history: genHistory(6.5, -0.04, 0.15, 24),
    significance:'high', direction:'down',
    description:'Headline CPI inflation measuring price changes for a basket of consumer goods and services.',
  },
  {
    id:'repo', label:'RBI Repo Rate', category:'Monetary Policy',
    unit:'%', currentValue:6.5, prevValue:6.5, change:0.0, changePct:0.0,
    history: genHistory(4.0, 0.025, 0.1, 24),
    significance:'high', direction:'neutral',
    description:'The rate at which the Reserve Bank of India lends money to commercial banks.',
  },
  {
    id:'gdp_growth', label:'GDP Growth Rate (YoY %)', category:'Growth',
    unit:'%', currentValue:7.2, prevValue:8.1, change:-0.9, changePct:-11.1,
    history: genHistory(5.8, 0.015, 0.3, 24),
    significance:'high', direction:'down',
    description:'India\'s real GDP growth rate, annualised, compared to the same quarter last year.',
  },
  {
    id:'iip', label:'Index of Industrial Production', category:'Manufacturing',
    unit:'% YoY', currentValue:4.8, prevValue:4.2, change:0.6, changePct:14.3,
    history: genHistory(3.5, 0.02, 0.4, 24),
    significance:'medium', direction:'up',
    description:'Measures the quantum of changes in the production of a basket of industrial products.',
  },
  {
    id:'pmi_mfg', label:'PMI Manufacturing', category:'Business Activity',
    unit:'index', currentValue:56.8, prevValue:55.9, change:0.9, changePct:1.6,
    history: genHistory(52.0, 0.005, 1.2, 24),
    significance:'high', direction:'up',
    description:'Purchasing Managers\' Index for manufacturing – above 50 signals expansion.',
  },
  {
    id:'pmi_svc', label:'PMI Services', category:'Business Activity',
    unit:'index', currentValue:58.4, prevValue:57.2, change:1.2, changePct:2.1,
    history: genHistory(53.0, 0.006, 1.4, 24),
    significance:'high', direction:'up',
    description:'Purchasing Managers\' Index for services – above 50 signals expansion.',
  },
  {
    id:'fii_flow', label:'FII Net Flows', category:'Capital Flows',
    unit:'₹ Cr', currentValue:8420, prevValue:-2340, change:10760, changePct:459.8,
    history: genHistory(2000, 0.01, 3500, 24),
    significance:'high', direction:'up',
    description:'Net Foreign Institutional Investor buying/selling in Indian equity markets.',
  },
  {
    id:'usd_inr', label:'USD/INR Exchange Rate', category:'Currency',
    unit:'INR', currentValue:83.45, prevValue:83.82, change:-0.37, changePct:-0.44,
    history: genHistory(82.2, 0.005, 0.4, 24),
    significance:'high', direction:'down',
    description:'US Dollar to Indian Rupee exchange rate.',
  },
  {
    id:'crude', label:'Brent Crude Oil', category:'Commodities',
    unit:'USD/bbl', currentValue:84.5, prevValue:88.2, change:-3.7, changePct:-4.2,
    history: genHistory(95.0, -0.008, 4.0, 24),
    significance:'high', direction:'down',
    description:'Price of Brent crude oil, a major input for India\'s import bill and inflation.',
  },
  {
    id:'10yr_gsec', label:'10-yr India G-Sec Yield', category:'Interest Rates',
    unit:'%', currentValue:7.18, prevValue:7.24, change:-0.06, changePct:-0.83,
    history: genHistory(7.45, -0.003, 0.08, 24),
    significance:'high', direction:'down',
    description:'Yield on the benchmark 10-year Indian government security.',
  },
  {
    id:'m3_growth', label:'M3 Money Supply Growth', category:'Monetary',
    unit:'% YoY', currentValue:9.8, prevValue:10.2, change:-0.4, changePct:-3.9,
    history: genHistory(11.5, -0.01, 0.3, 24),
    significance:'medium', direction:'down',
    description:'Broad money supply growth rate in India.',
  },
  {
    id:'credit_growth', label:'Bank Credit Growth', category:'Banking',
    unit:'% YoY', currentValue:14.2, prevValue:16.8, change:-2.6, changePct:-15.5,
    history: genHistory(12.0, 0.02, 0.8, 24),
    significance:'high', direction:'down',
    description:'Year-on-year growth in non-food bank credit across the Indian banking system.',
  },
  {
    id:'gst_collection', label:'GST Collections', category:'Fiscal',
    unit:'₹ Cr', currentValue:178482, prevValue:168337, change:10145, changePct:6.0,
    history: genHistory(140000, 0.015, 5000, 24),
    significance:'high', direction:'up',
    description:'Monthly Goods and Services Tax collection, a proxy for consumption and economic activity.',
  },
  {
    id:'trade_deficit', label:'Trade Deficit', category:'Trade',
    unit:'USD Bn', currentValue:-19.8, prevValue:-22.4, change:2.6, changePct:11.6,
    history: genHistory(-25.0, 0.01, 1.5, 24),
    significance:'medium', direction:'up',
    description:'Difference between India\'s merchandise exports and imports.',
  },
  {
    id:'forex_reserves', label:'Forex Reserves', category:'External Sector',
    unit:'USD Bn', currentValue:628.4, prevValue:598.2, change:30.2, changePct:5.0,
    history: genHistory(580.0, 0.008, 8.0, 24),
    significance:'high', direction:'up',
    description:'India\'s total foreign exchange reserves including gold, SDRs, and reserve tranche.',
  },
  {
    id:'unemployment', label:'Urban Unemployment Rate', category:'Labour',
    unit:'%', currentValue:7.8, prevValue:8.4, change:-0.6, changePct:-7.1,
    history: genHistory(9.5, -0.01, 0.3, 24),
    significance:'medium', direction:'down',
    description:'Urban unemployment rate as measured by CMIE periodic labour force survey.',
  },
  {
    id:'auto_sales', label:'Passenger Vehicle Sales', category:'Demand',
    unit:'units', currentValue:428000, prevValue:412000, change:16000, changePct:3.9,
    history: genHistory(380000, 0.012, 15000, 24),
    significance:'medium', direction:'up',
    description:'Monthly passenger vehicle retail sales, a leading indicator of consumer demand.',
  },
  {
    id:'cement_production', label:'Cement Production', category:'Infrastructure',
    unit:'MT', currentValue:28.4, prevValue:27.8, change:0.6, changePct:2.2,
    history: genHistory(24.0, 0.013, 1.0, 24),
    significance:'low', direction:'up',
    description:'Monthly cement production, a proxy for construction and infrastructure activity.',
  },
  {
    id:'power_consumption', label:'Power Consumption', category:'Energy',
    unit:'BU', currentValue:148.4, prevValue:142.8, change:5.6, changePct:3.9,
    history: genHistory(130.0, 0.014, 4.0, 24),
    significance:'medium', direction:'up',
    description:'Monthly electricity consumption in India, a leading indicator of industrial activity.',
  },
  {
    id:'cargo_traffic', label:'Port Cargo Traffic', category:'Trade',
    unit:'MT', currentValue:142.8, prevValue:138.4, change:4.4, changePct:3.2,
    history: genHistory(125.0, 0.012, 3.5, 24),
    significance:'low', direction:'up',
    description:'Monthly cargo traffic handled at major Indian ports, indicative of trade volume.',
  },
];

// -------------------------------------------------------
// 4. NEWS_ARTICLES – 50 mock financial news articles
// -------------------------------------------------------
export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  category: 'markets' | 'economy' | 'corporate' | 'global' | 'policy';
  sentiment: 'positive' | 'negative' | 'neutral';
  relatedTickers: string[];
  readMinutes: number;
}

export const NEWS_ARTICLES: NewsArticle[] = [
  { id:'n001', headline:'Nifty 50 Hits Fresh All-Time High Amid FII Buying Surge', summary:'The benchmark Nifty 50 index surged past 25,000 driven by strong foreign institutional investor inflows and upbeat Q4 earnings expectations.', source:'Economic Times', publishedAt:'2025-05-15T09:30:00Z', url:'#', category:'markets', sentiment:'positive', relatedTickers:['NIFTY 50'], readMinutes:3 },
  { id:'n002', headline:'RBI Keeps Repo Rate Unchanged at 6.5% for 7th Consecutive Meeting', summary:'The Monetary Policy Committee maintained its stance as inflation remains within the 4% target band, while focusing on withdrawing accommodation.', source:'Mint', publishedAt:'2025-05-14T11:00:00Z', url:'#', category:'policy', sentiment:'neutral', relatedTickers:['HDFCBANK','ICICIBANK','SBIN'], readMinutes:4 },
  { id:'n003', headline:'TCS Reports Strong Q4 FY2025 Revenue Growth of 12% YoY', summary:'Tata Consultancy Services beat analyst estimates with revenue of ₹63,854 crore and net profit of ₹12,224 crore, citing strong demand from BFSI clients.', source:'Business Standard', publishedAt:'2025-05-13T08:15:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['TCS'], readMinutes:3 },
  { id:'n004', headline:'Reliance Industries Plans ₹75,000 Cr Investment in Green Energy by 2030', summary:'RIL announced a major capex push into solar, hydrogen, and battery storage, aiming to become carbon net-zero by 2035.', source:'Financial Express', publishedAt:'2025-05-12T14:20:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['RELIANCE'], readMinutes:5 },
  { id:'n005', headline:'India GDP Growth Moderates to 7.2% in Q4 FY2025', summary:'NSO data shows slight deceleration from 8.1% in Q3, though full-year FY2025 growth at 7.6% outpaces all major economies.', source:'Reuters', publishedAt:'2025-05-11T10:00:00Z', url:'#', category:'economy', sentiment:'neutral', relatedTickers:[], readMinutes:4 },
  { id:'n006', headline:'Infosys Raises FY2026 Revenue Guidance to 8-10% Growth', summary:'The IT major cited strong deal wins in AI-powered transformation projects, particularly from US financial services and retail clients.', source:'Livemint', publishedAt:'2025-05-10T09:45:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['INFY'], readMinutes:3 },
  { id:'n007', headline:'HDFC Bank\'s Loan Book Crosses ₹25 Lakh Crore Milestone', summary:'Post-merger integration progressing smoothly, with net interest margins stabilizing at 3.4% and GNPA ratio improving to 1.24%.', source:'Economic Times', publishedAt:'2025-05-09T12:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['HDFCBANK'], readMinutes:4 },
  { id:'n008', headline:'Fed Signals Two Rate Cuts in 2025 Amid Cooling US Inflation', summary:'FOMC minutes indicate growing confidence that inflation is on a sustainable path to 2%, with cuts likely in September and December 2025.', source:'Bloomberg', publishedAt:'2025-05-08T19:30:00Z', url:'#', category:'global', sentiment:'positive', relatedTickers:['SPY','QQQ'], readMinutes:4 },
  { id:'n009', headline:'Bajaj Finance Sees 28% Jump in AUM, Asset Quality Holds Firm', summary:'The NBFC reported AUM of ₹3.82 lakh crore, gross NPA at 0.85%, and sustained growth across consumer durables and personal loan segments.', source:'Moneycontrol', publishedAt:'2025-05-07T11:30:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['BAJFINANCE'], readMinutes:3 },
  { id:'n010', headline:'India\'s Forex Reserves Hit Record $628 Billion', summary:'Rising FII inflows and RBI intervention pushed reserves to an all-time high, providing 11 months of import cover.', source:'PTI', publishedAt:'2025-05-06T16:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:[], readMinutes:2 },
  { id:'n011', headline:'Maruti Suzuki Launches New Hybrid SUV Targeting Premium Segment', summary:'The company unveiled the Grand Vitara Hybrid at ₹18.99 lakh, targeting the fast-growing utility vehicle market with a 25 km/l mileage claim.', source:'Auto Car India', publishedAt:'2025-05-05T10:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['MARUTI'], readMinutes:3 },
  { id:'n012', headline:'SEBI Tightens F&O Rules: Lot Sizes Doubled for Weekly Options', summary:'New framework effective August 2025 aims to curb excessive retail speculation in index derivatives, which saw ₹1.8 lakh crore daily turnover.', source:'SEBI Press Release', publishedAt:'2025-05-04T14:30:00Z', url:'#', category:'policy', sentiment:'negative', relatedTickers:[], readMinutes:5 },
  { id:'n013', headline:'Adani Group Announces $10 Billion Airport Expansion Plan', summary:'Adani Airports will invest in new terminals and runway expansions at 7 airports, targeting 500 million annual passengers by 2030.', source:'Business Today', publishedAt:'2025-05-03T09:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['ADANIENT'], readMinutes:4 },
  { id:'n014', headline:'ITC\'s FMCG Business Achieves ₹20,000 Crore Revenue Milestone', summary:'The company\'s agri and FMCG businesses drove diversification with cigarettes now contributing less than 40% to consolidated revenue.', source:'Economic Times', publishedAt:'2025-05-02T10:30:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['ITC'], readMinutes:3 },
  { id:'n015', headline:'Sun Pharma Receives FDA Approval for Key Specialty Drug', summary:'Ilumya\'s new indication for psoriatic arthritis gets US FDA clearance, potentially adding USD 800 million to peak annual sales.', source:'Drug Regulatory News', publishedAt:'2025-05-01T15:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['SUNPHARMA'], readMinutes:3 },
  { id:'n016', headline:'India\'s GST Collections Hit ₹2.1 Lakh Crore in April', summary:'A new record for monthly GST collection, up 12.4% YoY, pointing to strong consumption and formalisation of the economy.', source:'Ministry of Finance', publishedAt:'2025-04-30T10:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:[], readMinutes:2 },
  { id:'n017', headline:'Tata Motors JLR Business Reports Best-Ever Quarterly Profit', summary:'Jaguar Land Rover posted a £672 million pre-tax profit for Q4 FY2025, driven by Range Rover and Defender demand globally.', source:'Reuters', publishedAt:'2025-04-29T08:30:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['TATAMOTORS'], readMinutes:3 },
  { id:'n018', headline:'Bharti Airtel Adds 3.2 Million Mobile Subscribers in March', summary:'Airtel\'s 5G subscriber base crossed 80 million, while ARPU improved to ₹208, the highest among Indian telecom operators.', source:'TRAI Press', publishedAt:'2025-04-28T11:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['BHARTIARTL'], readMinutes:3 },
  { id:'n019', headline:'HUL Volume Growth Disappoints at 1.5% Amid Rural Stress', summary:'Hindustan Unilever\'s quarterly results showed margin improvement but muted volume as rural demand recovery remains uneven.', source:'Mint', publishedAt:'2025-04-27T09:45:00Z', url:'#', category:'corporate', sentiment:'negative', relatedTickers:['HINDUNILVR'], readMinutes:4 },
  { id:'n020', headline:'Wipro Announces 12,000-Seat AI Training Programme for Employees', summary:'The IT company is partnering with Google and Microsoft to upskill its workforce in generative AI and cloud engineering.', source:'Business Standard', publishedAt:'2025-04-26T10:15:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['WIPRO'], readMinutes:3 },
  { id:'n021', headline:'Gold Hits New Record High at $2,480 per Ounce', summary:'Geopolitical tensions and dollar weakness pushed gold to a fresh all-time high, benefiting Indian jewellery companies.', source:'CNBC', publishedAt:'2025-04-25T13:30:00Z', url:'#', category:'global', sentiment:'positive', relatedTickers:['TITAN','GLD'], readMinutes:3 },
  { id:'n022', headline:'India\'s CPI Inflation Drops to 3-Year Low of 4.1%', summary:'Falling vegetable and fuel prices drove headline inflation well within RBI\'s comfort zone, opening room for monetary easing.', source:'MOSPI', publishedAt:'2025-04-24T08:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:[], readMinutes:3 },
  { id:'n023', headline:'ICICI Bank Launches Instant Business Loan Platform for MSMEs', summary:'Using AI-driven underwriting, the bank can disburse loans up to ₹5 crore within 3 hours, targeting India\'s 63 million MSME segment.', source:'Livemint', publishedAt:'2025-04-23T14:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['ICICIBANK'], readMinutes:4 },
  { id:'n024', headline:'HCL Technologies Wins $1.2 Billion IT Managed Services Deal', summary:'The 5-year engagement with a US healthcare giant is HCL\'s largest-ever outsourcing contract, covering 42 countries.', source:'Economic Times', publishedAt:'2025-04-22T11:30:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['HCLTECH'], readMinutes:3 },
  { id:'n025', headline:'Axis Bank\'s Gross NPA Falls Below 1.5% for First Time in Decade', summary:'Improved credit culture and write-backs pushed asset quality to multi-year highs, with RoE now at 18.4%.', source:'Financial Express', publishedAt:'2025-04-21T09:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['AXISBANK'], readMinutes:3 },
  { id:'n026', headline:'L&T Wins ₹15,000 Crore Defence Shipbuilding Order from Navy', summary:'The engineering major will build 6 next-generation corvettes over 8 years, its largest single defence contract.', source:'PTI Defence', publishedAt:'2025-04-20T12:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['LT'], readMinutes:4 },
  { id:'n027', headline:'Nestle India\'s Maggi Hits 70% Market Share in Noodles Category', summary:'Sustained advertising and product innovation have helped Nestle recapture and exceed pre-2015 recall levels in the ₹4,000 crore instant noodles market.', source:'FMCG Monitor', publishedAt:'2025-04-19T10:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['NESTLEIND'], readMinutes:2 },
  { id:'n028', headline:'Titan\'s Jewellery Revenue Crosses ₹50,000 Crore Annually', summary:'Tanishq maintained its market leadership with same-store sales growth of 14%, driven by lab-grown diamond collections.', source:'Business Standard', publishedAt:'2025-04-18T09:30:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['TITAN'], readMinutes:3 },
  { id:'n029', headline:'SBI Reports Record Quarterly Net Profit of ₹18,331 Crore', summary:'The public sector giant benefited from write-backs, strong NII growth and record credit card spends, taking FY2025 profit to ₹65,000 crore.', source:'ET Markets', publishedAt:'2025-04-17T11:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['SBIN'], readMinutes:3 },
  { id:'n030', headline:'US Fed Balance Sheet Shrinks Below $7 Trillion', summary:'Quantitative tightening continues as the Fed reduces MBS and Treasury holdings, keeping long-end yields elevated globally.', source:'Federal Reserve', publishedAt:'2025-04-16T15:00:00Z', url:'#', category:'global', sentiment:'neutral', relatedTickers:['TLT','BND'], readMinutes:4 },
  { id:'n031', headline:'India Surpasses China in Services Export Growth for First Time', summary:'India\'s services exports reached USD 385 billion in FY2025, with IT, BPO, and telecom driving the 18% YoY surge.', source:'RBI Annual Report', publishedAt:'2025-04-15T08:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:[], readMinutes:4 },
  { id:'n032', headline:'Nifty Small Cap Index Outperforms Large Cap by 1,200 bps in CY2025', summary:'The broader market rally broadened significantly with midcap and smallcap indices delivering alpha amid earnings upgrades.', source:'NSE Research', publishedAt:'2025-04-14T10:30:00Z', url:'#', category:'markets', sentiment:'positive', relatedTickers:[], readMinutes:3 },
  { id:'n033', headline:'SEBI Allows Foreign Retail Investors to Directly Buy Indian ETFs', summary:'New regulations permit direct participation by qualified foreign individual investors in NIFTY 50 and Sectoral ETFs.', source:'SEBI Circular', publishedAt:'2025-04-13T12:00:00Z', url:'#', category:'policy', sentiment:'positive', relatedTickers:[], readMinutes:3 },
  { id:'n034', headline:'Crude Oil Falls on US Inventory Build; Downstream Stocks Rally', summary:'A surprise build of 4.2 million barrels in US crude inventories sent Brent down 3%, boosting margins for Indian refiners.', source:'Reuters Energy', publishedAt:'2025-04-12T16:00:00Z', url:'#', category:'global', sentiment:'positive', relatedTickers:['RELIANCE'], readMinutes:3 },
  { id:'n035', headline:'India\'s Manufacturing PMI Reaches 14-Month High of 58.1', summary:'New orders, international demand, and inventory destocking drove the Manufacturing PMI to its highest level since early 2024.', source:'S&P Global', publishedAt:'2025-04-11T09:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:[], readMinutes:2 },
  { id:'n036', headline:'Budget 2025 Announces ₹1.4 Lakh Crore Infrastructure Capex', summary:'Finance Minister allocated record capital expenditure for roads, railways, and urban infrastructure, maintaining fiscal deficit at 5.1% of GDP.', source:'Ministry of Finance', publishedAt:'2025-04-10T12:00:00Z', url:'#', category:'policy', sentiment:'positive', relatedTickers:['LT','ADANIENT'], readMinutes:6 },
  { id:'n037', headline:'India\'s UPI Processes 14 Billion Transactions Worth ₹20 Lakh Crore in March', summary:'Digital payments growth remained robust with UPI recording a new monthly high, reinforcing India\'s fintech leadership globally.', source:'NPCI Data', publishedAt:'2025-04-09T10:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:['HDFCBANK','ICICIBANK'], readMinutes:3 },
  { id:'n038', headline:'NVIDIA Partners with Infosys for AI-First Enterprise Transformation', summary:'The partnership will deploy 50,000 GPU compute clusters for Indian enterprises through Infosys Topaz AI platform.', source:'ET Tech', publishedAt:'2025-04-08T09:30:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['INFY','NVDA'], readMinutes:4 },
  { id:'n039', headline:'India Becomes World\'s Third Largest Auto Market, Surpassing Japan', summary:'FY2025 vehicle sales of 5.2 million units placed India ahead of Japan, trailing only China and the US globally.', source:'SIAM', publishedAt:'2025-04-07T11:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:['MARUTI','TATAMOTORS'], readMinutes:3 },
  { id:'n040', headline:'Rupee Strengthens to 82.8 Against Dollar on Strong FII Inflows', summary:'The INR posted its best weekly gain in two years as global risk appetite improved and India\'s macro fundamentals attracted capital.', source:'Currency Today', publishedAt:'2025-04-06T15:30:00Z', url:'#', category:'markets', sentiment:'positive', relatedTickers:[], readMinutes:2 },
  { id:'n041', headline:'Rising US Bond Yields Trigger EM Equity Outflows', summary:'A stronger-than-expected US jobs report pushed 10-year Treasury yields to 4.8%, causing EM portfolio rebalancing globally.', source:'Bloomberg', publishedAt:'2025-04-05T14:00:00Z', url:'#', category:'global', sentiment:'negative', relatedTickers:['TLT','EFA','EEM'], readMinutes:4 },
  { id:'n042', headline:'Sun Pharma\'s US Generic Business Grows 18% on New Product Launches', summary:'Eight new ANDA approvals in Q4, including three Para IV filings, strengthened Sun\'s US pipeline across specialty and chronic segments.', source:'Drug Regulatory', publishedAt:'2025-04-04T08:30:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['SUNPHARMA'], readMinutes:3 },
  { id:'n043', headline:'Bajaj Finance Acquires 26% Stake in Bajaj Allianz Life Insurance', summary:'The acquisition for ₹4,800 crore will deepen Bajaj Finance\'s push into wealth management and protection products.', source:'Livemint', publishedAt:'2025-04-03T10:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['BAJFINANCE'], readMinutes:3 },
  { id:'n044', headline:'L&T Technology Services Wins 5-Year EV Platform Contract from European OEM', summary:'The contract, worth approximately €380 million, covers full-stack electric vehicle software development and validation services.', source:'ET Auto', publishedAt:'2025-04-02T09:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['LT'], readMinutes:3 },
  { id:'n045', headline:'China PMI Contraction Raises Global Growth Concerns', summary:'China\'s Caixin Manufacturing PMI fell to 49.3, signalling contraction for the first time in 8 months and weighing on commodity prices.', source:'Caixin Media', publishedAt:'2025-04-01T07:00:00Z', url:'#', category:'global', sentiment:'negative', relatedTickers:['EEM','VWO'], readMinutes:4 },
  { id:'n046', headline:'India\'s IT Sector Hiring Rebounds; 220,000 Freshers to be Recruited in FY2026', summary:'After a cautious FY2025, top-5 IT firms have announced campus hiring resurgence driven by GenAI project ramp-ups.', source:'NASSCOM', publishedAt:'2025-03-31T10:00:00Z', url:'#', category:'economy', sentiment:'positive', relatedTickers:['TCS','INFY','WIPRO','HCLTECH'], readMinutes:3 },
  { id:'n047', headline:'Titan\'s CaratLane Surpasses 300 Stores, Eyes Pan-India Network', summary:'The online-to-offline jewellery platform has become Titan\'s fastest growing business with ₹2,400 crore annual revenue run rate.', source:'Retail Today', publishedAt:'2025-03-30T11:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['TITAN'], readMinutes:2 },
  { id:'n048', headline:'SBI Life Becomes India\'s Most Profitable Life Insurer', summary:'State Bank subsidiary reported VNB margin of 28.4% and new business premium of ₹35,200 crore, overtaking HDFC Life for the first time.', source:'Insurance Times', publishedAt:'2025-03-29T09:00:00Z', url:'#', category:'corporate', sentiment:'positive', relatedTickers:['SBIN'], readMinutes:3 },
  { id:'n049', headline:'India Launches National Semiconductor Mission Phase 2', summary:'₹76,000 crore allocated for wafer fab, OSAT, and chip design clusters in Gujarat, Karnataka, and UP under PLI expansion.', source:'MeitY', publishedAt:'2025-03-28T12:00:00Z', url:'#', category:'policy', sentiment:'positive', relatedTickers:[], readMinutes:5 },
  { id:'n050', headline:'Nifty 50 P/E at 22.4x – Fairly Valued or Overheated?', summary:'Analysts debate market valuations as Nifty earnings growth of 15% for FY2026 is expected to justify current multiples, though global risks remain.', source:'ET Markets', publishedAt:'2025-03-27T10:00:00Z', url:'#', category:'markets', sentiment:'neutral', relatedTickers:[], readMinutes:5 },
];

// -------------------------------------------------------
// 5. CALENDAR_EVENTS – 2 months ahead
// -------------------------------------------------------
export interface CalendarEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  category: 'earnings' | 'economic' | 'policy' | 'dividend' | 'expiry';
  importance: 'high' | 'medium' | 'low';
  ticker?: string;
  expected?: string;
  previous?: string;
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id:'c001', date:'2025-05-19', time:'14:30', title:'RBI MPC Minutes Release', category:'policy', importance:'high', expected:'Neutral stance maintained', previous:'Neutral' },
  { id:'c002', date:'2025-05-20', time:'09:00', title:'TCS Q1 FY2026 Results', category:'earnings', importance:'high', ticker:'TCS', expected:'Revenue ₹64,200 Cr | EPS ₹30.2', previous:'₹63,854 Cr | ₹29.8' },
  { id:'c003', date:'2025-05-21', time:'09:00', title:'Infosys Q1 FY2026 Results', category:'earnings', importance:'high', ticker:'INFY', expected:'Revenue ₹40,500 Cr | EPS ₹16.8', previous:'₹39,120 Cr | ₹16.2' },
  { id:'c004', date:'2025-05-22', time:'09:00', title:'HDFC Bank Q1 FY2026 Results', category:'earnings', importance:'high', ticker:'HDFCBANK', expected:'NII ₹29,500 Cr | EPS ₹22.4', previous:'₹28,470 Cr | ₹21.6' },
  { id:'c005', date:'2025-05-22', title:'Nifty Monthly Expiry', category:'expiry', importance:'high' },
  { id:'c006', date:'2025-05-23', time:'12:00', title:'India CPI Inflation Data (April)', category:'economic', importance:'high', expected:'4.2%', previous:'4.9%' },
  { id:'c007', date:'2025-05-23', time:'09:00', title:'Reliance Industries Q1 FY2026 Results', category:'earnings', importance:'high', ticker:'RELIANCE', expected:'Revenue ₹250,000 Cr | EPS ₹25.2', previous:'₹243,000 Cr | ₹24.6' },
  { id:'c008', date:'2025-05-26', title:'US Memorial Day (Markets Closed)', category:'economic', importance:'medium' },
  { id:'c009', date:'2025-05-27', time:'09:00', title:'ICICI Bank Q1 FY2026 Results', category:'earnings', importance:'high', ticker:'ICICIBANK', expected:'NII ₹19,800 Cr | EPS ₹19.2', previous:'₹19,093 Cr | ₹18.6' },
  { id:'c010', date:'2025-05-27', time:'14:00', title:'India Trade Deficit Data (April)', category:'economic', importance:'medium', expected:'-$19.5 Bn', previous:'-$19.8 Bn' },
  { id:'c011', date:'2025-05-28', time:'09:00', title:'Bajaj Finance Q1 FY2026 Results', category:'earnings', importance:'high', ticker:'BAJFINANCE', expected:'NII ₹9,200 Cr | EPS ₹72.4', previous:'₹8,655 Cr | ₹69.8' },
  { id:'c012', date:'2025-05-28', time:'18:00', title:'US FOMC Meeting Minutes', category:'policy', importance:'high', expected:'Hawkish lean expected', previous:'Hold at 5.25-5.5%' },
  { id:'c013', date:'2025-05-29', time:'09:00', title:'L&T Q1 FY2026 Results', category:'earnings', importance:'medium', ticker:'LT', expected:'Revenue ₹64,000 Cr | EPS ₹30.8', previous:'₹61,200 Cr | ₹29.4' },
  { id:'c014', date:'2025-05-29', time:'09:00', title:'Maruti Suzuki Q1 FY2026 Results', category:'earnings', importance:'medium', ticker:'MARUTI', expected:'Revenue ₹41,000 Cr | EPS ₹132', previous:'₹39,870 Cr | ₹128' },
  { id:'c015', date:'2025-05-30', time:'18:30', title:'US PCE Inflation Data (April)', category:'economic', importance:'high', expected:'2.5%', previous:'2.6%' },
  { id:'c016', date:'2025-06-02', time:'09:00', title:'India Manufacturing PMI (May)', category:'economic', importance:'medium', expected:'57.0', previous:'56.8' },
  { id:'c017', date:'2025-06-04', time:'09:00', title:'India Services PMI (May)', category:'economic', importance:'medium', expected:'58.0', previous:'58.4' },
  { id:'c018', date:'2025-06-05', time:'18:30', title:'US Non-Farm Payrolls (May)', category:'economic', importance:'high', expected:'165K', previous:'177K' },
  { id:'c019', date:'2025-06-05', time:'09:00', title:'SBI Annual General Meeting', category:'earnings', importance:'medium', ticker:'SBIN' },
  { id:'c020', date:'2025-06-06', time:'09:00', title:'HCL Technologies Q1 FY2026 Results', category:'earnings', importance:'medium', ticker:'HCLTECH', expected:'Revenue ₹30,200 Cr | EPS ₹16.8', previous:'₹28,057 Cr | ₹16.4' },
  { id:'c021', date:'2025-06-09', time:'09:00', title:'Wipro Q1 FY2026 Results', category:'earnings', importance:'medium', ticker:'WIPRO', expected:'Revenue ₹22,800 Cr | EPS ₹5.8', previous:'₹22,208 Cr | ₹5.6' },
  { id:'c022', date:'2025-06-10', time:'18:30', title:'US CPI Inflation Data (May)', category:'economic', importance:'high', expected:'3.1%', previous:'3.4%' },
  { id:'c023', date:'2025-06-11', time:'09:00', title:'Axis Bank Q1 FY2026 Results', category:'earnings', importance:'medium', ticker:'AXISBANK', expected:'NII ₹13,200 Cr | EPS ₹16.8', previous:'₹12,815 Cr | ₹16.2' },
  { id:'c024', date:'2025-06-12', title:'Nifty June Series Expiry', category:'expiry', importance:'high' },
  { id:'c025', date:'2025-06-13', time:'16:00', title:'HDFC Bank Dividend Record Date', category:'dividend', importance:'medium', ticker:'HDFCBANK', expected:'₹19.5/share' },
  { id:'c026', date:'2025-06-17', time:'18:00', title:'US FOMC Interest Rate Decision', category:'policy', importance:'high', expected:'Hold at 5.25-5.5%', previous:'5.25-5.5%' },
  { id:'c027', date:'2025-06-18', time:'09:00', title:'India Wholesale Price Index (May)', category:'economic', importance:'medium', expected:'1.8%', previous:'0.5%' },
  { id:'c028', date:'2025-06-19', time:'09:00', title:'Titan Q1 FY2026 Results', category:'earnings', importance:'medium', ticker:'TITAN', expected:'Revenue ₹15,800 Cr | EPS ₹11.2', previous:'₹15,130 Cr | ₹10.8' },
  { id:'c029', date:'2025-06-20', time:'12:00', title:'India Foreign Reserves Data', category:'economic', importance:'low', expected:'$635 Bn', previous:'$628.4 Bn' },
  { id:'c030', date:'2025-06-27', time:'18:30', title:'US GDP Growth (Q1 2025 Final)', category:'economic', importance:'high', expected:'2.8%', previous:'2.8% (preliminary)' },
];

// -------------------------------------------------------
// 6. GURUS – 10 institutional investors & their holdings
// -------------------------------------------------------
export interface GuruHolding {
  ticker: string;
  name: string;
  shares: number;
  value: number;       // USD millions
  portfolioPct: number;
  change: 'added' | 'reduced' | 'new' | 'sold' | 'unchanged';
  changePct: number;
}

export interface Guru {
  id: string;
  name: string;
  fund: string;
  aum: number;         // USD billions
  strategy: string;
  topHoldings: GuruHolding[];
  quarterlyReturn: number;
  ytdReturn: number;
  portfolioTurnover: number;
  lastUpdated: string;
}

export const GURUS: Guru[] = [
  {
    id:'buffett', name:'Warren Buffett', fund:'Berkshire Hathaway',
    aum:380, strategy:'Quality Value / Long-Term Compounders',
    quarterlyReturn:4.8, ytdReturn:12.4, portfolioTurnover:0.05,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'AAPL',  name:'Apple Inc.',           shares:789000000, value:140000, portfolioPct:40.2, change:'reduced',   changePct:-12.0 },
      { ticker:'BAC',   name:'Bank of America',      shares:1280000000,value:39200,  portfolioPct:11.2, change:'unchanged', changePct:0.0 },
      { ticker:'AXP',   name:'American Express',     shares:151600000, value:38200,  portfolioPct:10.9, change:'unchanged', changePct:0.0 },
      { ticker:'KO',    name:'Coca-Cola',             shares:400000000, value:24800,  portfolioPct:7.1,  change:'unchanged', changePct:0.0 },
      { ticker:'CVX',   name:'Chevron',               shares:118600000, value:16200,  portfolioPct:4.6,  change:'reduced',   changePct:-8.0 },
    ],
  },
  {
    id:'lynch', name:'Peter Lynch (Style)', fund:'Fidelity Magellan',
    aum:24, strategy:'GARP – Growth at a Reasonable Price',
    quarterlyReturn:6.2, ytdReturn:18.4, portfolioTurnover:0.85,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'MSFT',  name:'Microsoft',    shares:12400000, value:5142,  portfolioPct:8.4, change:'added',     changePct:15.0 },
      { ticker:'NVDA',  name:'NVIDIA',        shares:8200000,  value:1107,  portfolioPct:6.2, change:'added',     changePct:28.0 },
      { ticker:'V',     name:'Visa',          shares:18200000, value:5096,  portfolioPct:5.8, change:'unchanged', changePct:0.0 },
      { ticker:'MA',    name:'Mastercard',    shares:9800000,  value:4312,  portfolioPct:5.2, change:'added',     changePct:8.0 },
      { ticker:'UNH',   name:'UnitedHealth',  shares:7200000,  value:3456,  portfolioPct:4.8, change:'reduced',   changePct:-5.0 },
    ],
  },
  {
    id:'ackman', name:'Bill Ackman', fund:'Pershing Square Capital',
    aum:18.5, strategy:'Activist Value Investing',
    quarterlyReturn:8.4, ytdReturn:24.2, portfolioTurnover:0.25,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'HLT',   name:'Hilton Worldwide',  shares:12800000, value:2688, portfolioPct:16.4, change:'unchanged', changePct:0.0 },
      { ticker:'QSR',   name:'Restaurant Brands', shares:38400000, value:2534, portfolioPct:15.4, change:'unchanged', changePct:0.0 },
      { ticker:'CMG',   name:'Chipotle Mexican',  shares:5200000,  value:1482, portfolioPct:9.0,  change:'unchanged', changePct:0.0 },
      { ticker:'GOOGL', name:'Alphabet',           shares:9600000,  value:1680, portfolioPct:10.2, change:'added',     changePct:45.0 },
      { ticker:'NFLX',  name:'Netflix',            shares:4200000,  value:2814, portfolioPct:17.1, change:'added',     changePct:62.0 },
    ],
  },
  {
    id:'dalio', name:'Ray Dalio', fund:'Bridgewater Associates',
    aum:150, strategy:'All Weather / Risk Parity',
    quarterlyReturn:2.8, ytdReturn:7.2, portfolioTurnover:1.20,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'SPY',   name:'SPDR S&P 500 ETF',   shares:4200000,  value:2436, portfolioPct:4.2, change:'reduced',   changePct:-8.0 },
      { ticker:'GLD',   name:'SPDR Gold Shares',    shares:8400000,  value:1848, portfolioPct:3.2, change:'added',     changePct:12.0 },
      { ticker:'EEM',   name:'iShares MSCI EM',     shares:24200000, value:1029, portfolioPct:1.8, change:'unchanged', changePct:0.0 },
      { ticker:'VWO',   name:'Vanguard EM ETF',      shares:18400000, value:810,  portfolioPct:1.4, change:'added',     changePct:8.0 },
      { ticker:'TLT',   name:'iShares 20+ Bond',    shares:9200000,  value:828,  portfolioPct:1.4, change:'added',     changePct:15.0 },
    ],
  },
  {
    id:'soros', name:'George Soros', fund:'Soros Fund Management',
    aum:28, strategy:'Global Macro / Reflexivity Theory',
    quarterlyReturn:5.4, ytdReturn:14.8, portfolioTurnover:2.40,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'NVDA',  name:'NVIDIA',              shares:3200000,  value:432,  portfolioPct:5.8, change:'new',       changePct:100.0 },
      { ticker:'AMZN',  name:'Amazon',              shares:4800000,  value:936,  portfolioPct:12.5, change:'added',    changePct:32.0 },
      { ticker:'GOOGL', name:'Alphabet',             shares:5400000,  value:945,  portfolioPct:12.6, change:'unchanged',changePct:0.0 },
      { ticker:'META',  name:'Meta Platforms',       shares:1800000,  value:1062, portfolioPct:14.2, change:'added',    changePct:28.0 },
      { ticker:'EEM',   name:'iShares MSCI EM',      shares:8200000,  value:349,  portfolioPct:4.7,  change:'reduced',  changePct:-15.0 },
    ],
  },
  {
    id:'tepper', name:'David Tepper', fund:'Appaloosa Management',
    aum:14.5, strategy:'Distressed & Event-Driven Value',
    quarterlyReturn:7.2, ytdReturn:21.4, portfolioTurnover:0.95,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'META',  name:'Meta Platforms',   shares:3400000,  value:2006, portfolioPct:15.8, change:'unchanged', changePct:0.0 },
      { ticker:'AMZN',  name:'Amazon',           shares:5800000,  value:1131, portfolioPct:8.9,  change:'added',     changePct:22.0 },
      { ticker:'MSFT',  name:'Microsoft',        shares:4200000,  value:1743, portfolioPct:13.7, change:'unchanged', changePct:0.0 },
      { ticker:'GOOGL', name:'Alphabet',          shares:6200000,  value:1085, portfolioPct:8.5,  change:'added',     changePct:18.0 },
      { ticker:'BABA',  name:'Alibaba',           shares:8400000,  value:756,  portfolioPct:5.9,  change:'added',     changePct:35.0 },
    ],
  },
  {
    id:'simons', name:'Jim Simons', fund:'Renaissance Medallion',
    aum:130, strategy:'Quantitative / Statistical Arbitrage',
    quarterlyReturn:9.8, ytdReturn:28.4, portfolioTurnover:5.80,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'SPY',   name:'SPDR S&P 500',     shares:2800000,  value:1624, portfolioPct:1.2, change:'added',     changePct:8.0 },
      { ticker:'QQQ',   name:'Invesco QQQ',       shares:2400000,  value:1188, portfolioPct:0.9, change:'added',     changePct:12.0 },
      { ticker:'NVDA',  name:'NVIDIA',            shares:1800000,  value:243,  portfolioPct:0.7, change:'new',       changePct:100.0 },
      { ticker:'TSLA',  name:'Tesla',             shares:3200000,  value:800,  portfolioPct:1.8, change:'added',     changePct:45.0 },
      { ticker:'AAPL',  name:'Apple',             shares:4200000,  value:798,  portfolioPct:1.4, change:'unchanged', changePct:0.0 },
    ],
  },
  {
    id:'munger', name:'Charlie Munger (Legacy)', fund:'Daily Journal Corp',
    aum:0.8, strategy:'Focused Value / Circle of Competence',
    quarterlyReturn:3.8, ytdReturn:11.2, portfolioTurnover:0.02,
    lastUpdated:'2024-11-14',
    topHoldings:[
      { ticker:'BABA',  name:'Alibaba',          shares:600000,  value:54,   portfolioPct:28.4, change:'unchanged', changePct:0.0 },
      { ticker:'BNS',   name:'Bank of Nova Scotia',shares:1200000, value:48,  portfolioPct:25.2, change:'unchanged', changePct:0.0 },
      { ticker:'WFC',   name:'Wells Fargo',       shares:1600000, value:104,  portfolioPct:54.8, change:'unchanged', changePct:0.0 },
      { ticker:'USB',   name:'US Bancorp',        shares:1000000, value:36,   portfolioPct:19.0, change:'unchanged', changePct:0.0 },
      { ticker:'BAC',   name:'Bank of America',   shares:800000,  value:24,   portfolioPct:12.6, change:'unchanged', changePct:0.0 },
    ],
  },
  {
    id:'rakesh', name:'Rakesh Jhunjhunwala (Legacy)', fund:'Rare Enterprises',
    aum:5.5, strategy:'India Long-Term Growth GARP',
    quarterlyReturn:5.2, ytdReturn:15.4, portfolioTurnover:0.15,
    lastUpdated:'2022-08-14',
    topHoldings:[
      { ticker:'TITAN',     name:'Titan Company',         shares:47000000,  value:2844, portfolioPct:52.4, change:'unchanged', changePct:0.0 },
      { ticker:'SBIN',      name:'State Bank of India',   shares:96000000,  value:1352, portfolioPct:24.9, change:'added',     changePct:8.0 },
      { ticker:'TATAMOTORS',name:'Tata Motors',           shares:36000000,  value:585,  portfolioPct:10.8, change:'added',     changePct:12.0 },
      { ticker:'BHARTIARTL',name:'Bharti Airtel',         shares:16000000,  value:432,  portfolioPct:7.9,  change:'added',     changePct:5.0 },
      { ticker:'MARUTI',    name:'Maruti Suzuki',         shares:1200000,   value:298,  portfolioPct:5.5,  change:'unchanged', changePct:0.0 },
    ],
  },
  {
    id:'samir', name:'Samir Arora', fund:'Helios Capital',
    aum:4.8, strategy:'India & ASEAN Growth Equities',
    quarterlyReturn:6.4, ytdReturn:18.8, portfolioTurnover:0.45,
    lastUpdated:'2025-02-14',
    topHoldings:[
      { ticker:'HDFCBANK',  name:'HDFC Bank',          shares:24000000, value:652,  portfolioPct:15.2, change:'added',    changePct:12.0 },
      { ticker:'INFY',      name:'Infosys',             shares:18000000, value:554,  portfolioPct:12.9, change:'added',    changePct:8.0 },
      { ticker:'ICICIBANK', name:'ICICI Bank',          shares:28000000, value:600,  portfolioPct:14.0, change:'unchanged',changePct:0.0 },
      { ticker:'BAJFINANCE',name:'Bajaj Finance',       shares:2400000,  value:330,  portfolioPct:7.7,  change:'reduced',  changePct:-10.0 },
      { ticker:'RELIANCE',  name:'Reliance Industries', shares:8000000,  value:380,  portfolioPct:8.9,  change:'unchanged',changePct:0.0 },
    ],
  },
];
