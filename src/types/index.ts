export interface Asset {
  symbol: string;
  weight: number; // 0-100
}

export interface PortfolioSettings {
  startYear: number;
  endYear: number;
  rebalance: 'none' | 'monthly' | 'quarterly' | 'annual';
  riskFreeRate: number; // default 0.06
  benchmark: 'SPY' | 'QQQ' | 'BND' | 'none';
  initialAmount: number; // default 100000
}

export interface BacktestResults {
  portfolioValues: number[];
  benchmarkValues: number[];
  dates: string[];
  annualReturns: Record<string, number>;
  benchmarkAnnualReturns: Record<string, number>;
  metrics: PortfolioMetrics;
}

export interface PortfolioMetrics {
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  sharpe: number;
  sortino: number;
  annualizedVolatility: number;
  calmar: number;
  treynor: number;
  omega: number;
  martin: number;
  informationRatio: number;
  beta: number;
  alpha: number;
  rSquared: number;
  trackingError: number;
  var95: number;
  cvar95: number;
  ulcerIndex: number;
  painIndex: number;
  skewness: number;
  kurtosis: number;
  tailRatio: number;
  gainLossRatio: number;
  winRate: number;
  bestYear: number;
  worstYear: number;
  bestMonth: number;
  worstMonth: number;
  avgDrawdown: number;
  maxDrawdownDuration: number;
  battingAverage: number;
  activeReturn: number;
  modigliani: number;
  recoveryFactor: number;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
}

export interface PriceAlert {
  id: string;
  ticker: string;
  condition: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PE_BELOW' | 'GF_SCORE_ABOVE' | 'INSIDER_BUY' | 'GURU_BUY';
  targetPrice: number;
  isActive: boolean;
  triggered: boolean;
  createdAt: string;
}

export interface AssetItem {
  symbol: string;
  name: string;
  type: string;
  price: number;
  change1d: number;
  return1y: number;
  return3y: number;
  return5y: number;
  volatility: number;
  sharpe: number;
  expenseRatio: number;
  aum: number;
  dividendYield: number;
  sector: string;
}
