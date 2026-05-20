// ============================================================
// YourDhan – Sector Median Valuation & Profitability Benchmarks
// ============================================================

export interface SectorMedianMetrics {
  // Profitability
  grossMargin: number;
  opMargin: number;
  netMargin: number;
  ebitdaMargin: number;
  roic: number;
  roe: number;
  roa: number;
  // Valuation
  pe: number;
  pb: number;
  ps: number;
  ev_ebitda: number;
  ev_sales: number;
  // Growth (3-yr CAGR, %)
  revenueGrowth3y: number;
  epsGrowth3y: number;
  // Leverage & Liquidity
  debtToEquity: number;
  currentRatio: number;
  interestCoverage: number;
  // Efficiency
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesDays: number;
  // Cash Flow
  fcfMargin: number;
  // Dividend
  dividendYield: number;
  payoutRatio: number;
}

export const SECTOR_MEDIANS: Record<string, SectorMedianMetrics> = {

  IT: {
    grossMargin: 32,   opMargin: 22,   netMargin: 18,
    ebitdaMargin: 26,  roic: 28,       roe: 24,       roa: 18,
    pe: 28,            pb: 6.2,        ps: 4.8,       ev_ebitda: 18,  ev_sales: 4.2,
    revenueGrowth3y: 12, epsGrowth3y: 14,
    debtToEquity: 0.05, currentRatio: 2.8, interestCoverage: 45,
    assetTurnover: 0.82, inventoryTurnover: 0, receivablesDays: 62,
    fcfMargin: 16, dividendYield: 1.8, payoutRatio: 40,
  },

  Financials: {
    grossMargin: 55,   opMargin: 30,   netMargin: 22,
    ebitdaMargin: 38,  roic: 14,       roe: 16,       roa: 1.4,
    pe: 18,            pb: 2.8,        ps: 3.2,       ev_ebitda: 12,  ev_sales: 2.8,
    revenueGrowth3y: 16, epsGrowth3y: 18,
    debtToEquity: 8.50, currentRatio: 1.1, interestCoverage: 4,
    assetTurnover: 0.08, inventoryTurnover: 0, receivablesDays: 0,
    fcfMargin: 18, dividendYield: 1.2, payoutRatio: 22,
  },

  FMCG: {
    grossMargin: 48,   opMargin: 18,   netMargin: 13,
    ebitdaMargin: 22,  roic: 32,       roe: 38,       roa: 18,
    pe: 52,            pb: 14.8,       ps: 6.2,       ev_ebitda: 38,  ev_sales: 5.8,
    revenueGrowth3y: 8,  epsGrowth3y: 10,
    debtToEquity: 0.08, currentRatio: 1.4, interestCoverage: 82,
    assetTurnover: 1.22, inventoryTurnover: 8.4, receivablesDays: 18,
    fcfMargin: 12, dividendYield: 2.4, payoutRatio: 82,
  },

  Pharma: {
    grossMargin: 62,   opMargin: 20,   netMargin: 15,
    ebitdaMargin: 26,  roic: 18,       roe: 16,       roa: 10,
    pe: 32,            pb: 4.8,        ps: 4.2,       ev_ebitda: 22,  ev_sales: 4.0,
    revenueGrowth3y: 11, epsGrowth3y: 14,
    debtToEquity: 0.15, currentRatio: 2.2, interestCoverage: 28,
    assetTurnover: 0.58, inventoryTurnover: 4.2, receivablesDays: 72,
    fcfMargin: 12, dividendYield: 0.8, payoutRatio: 25,
  },

  Auto: {
    grossMargin: 28,   opMargin: 10,   netMargin: 7,
    ebitdaMargin: 14,  roic: 12,       roe: 14,       roa: 6,
    pe: 24,            pb: 3.4,        ps: 1.4,       ev_ebitda: 14,  ev_sales: 1.2,
    revenueGrowth3y: 12, epsGrowth3y: 18,
    debtToEquity: 0.85, currentRatio: 1.2, interestCoverage: 12,
    assetTurnover: 0.92, inventoryTurnover: 6.8, receivablesDays: 28,
    fcfMargin: 5, dividendYield: 1.2, payoutRatio: 28,
  },

  Energy: {
    grossMargin: 18,   opMargin: 12,   netMargin: 8,
    ebitdaMargin: 16,  roic: 10,       roe: 12,       roa: 5,
    pe: 14,            pb: 1.8,        ps: 0.8,       ev_ebitda: 8,   ev_sales: 0.9,
    revenueGrowth3y: 10, epsGrowth3y: 12,
    debtToEquity: 0.65, currentRatio: 1.1, interestCoverage: 8,
    assetTurnover: 0.68, inventoryTurnover: 12.4, receivablesDays: 42,
    fcfMargin: 6, dividendYield: 1.5, payoutRatio: 18,
  },

  Telecom: {
    grossMargin: 55,   opMargin: 22,   netMargin: 8,
    ebitdaMargin: 38,  roic: 8,        roe: 10,       roa: 3,
    pe: 28,            pb: 3.2,        ps: 2.4,       ev_ebitda: 10,  ev_sales: 3.8,
    revenueGrowth3y: 14, epsGrowth3y: 45,
    debtToEquity: 2.20, currentRatio: 0.85, interestCoverage: 4,
    assetTurnover: 0.32, inventoryTurnover: 0, receivablesDays: 32,
    fcfMargin: 4, dividendYield: 0.8, payoutRatio: 20,
  },

  Construction: {
    grossMargin: 22,   opMargin: 12,   netMargin: 7,
    ebitdaMargin: 15,  roic: 14,       roe: 16,       roa: 5,
    pe: 32,            pb: 4.8,        ps: 2.2,       ev_ebitda: 18,  ev_sales: 2.0,
    revenueGrowth3y: 15, epsGrowth3y: 22,
    debtToEquity: 0.85, currentRatio: 1.4, interestCoverage: 8,
    assetTurnover: 0.72, inventoryTurnover: 3.2, receivablesDays: 82,
    fcfMargin: 4, dividendYield: 0.8, payoutRatio: 25,
  },

  Consumer: {
    grossMargin: 45,   opMargin: 20,   netMargin: 14,
    ebitdaMargin: 24,  roic: 24,       roe: 28,       roa: 14,
    pe: 65,            pb: 18.2,       ps: 9.2,       ev_ebitda: 45,  ev_sales: 8.4,
    revenueGrowth3y: 18, epsGrowth3y: 22,
    debtToEquity: 0.12, currentRatio: 1.8, interestCoverage: 42,
    assetTurnover: 1.15, inventoryTurnover: 5.8, receivablesDays: 24,
    fcfMargin: 10, dividendYield: 0.8, payoutRatio: 32,
  },

  Diversified: {
    grossMargin: 25,   opMargin: 12,   netMargin: 6,
    ebitdaMargin: 16,  roic: 8,        roe: 10,       roa: 4,
    pe: 22,            pb: 2.8,        ps: 1.2,       ev_ebitda: 12,  ev_sales: 1.4,
    revenueGrowth3y: 20, epsGrowth3y: 25,
    debtToEquity: 1.80, currentRatio: 1.0, interestCoverage: 3,
    assetTurnover: 0.52, inventoryTurnover: 5.0, receivablesDays: 55,
    fcfMargin: 3, dividendYield: 0.4, payoutRatio: 10,
  },

  Cement: {
    grossMargin: 35,   opMargin: 18,   netMargin: 10,
    ebitdaMargin: 22,  roic: 14,       roe: 14,       roa: 7,
    pe: 28,            pb: 4.2,        ps: 2.8,       ev_ebitda: 16,  ev_sales: 2.6,
    revenueGrowth3y: 10, epsGrowth3y: 22,
    debtToEquity: 0.42, currentRatio: 1.2, interestCoverage: 14,
    assetTurnover: 0.62, inventoryTurnover: 8.2, receivablesDays: 28,
    fcfMargin: 8, dividendYield: 1.2, payoutRatio: 30,
  },

  Metals: {
    grossMargin: 22,   opMargin: 12,   netMargin: 7,
    ebitdaMargin: 16,  roic: 10,       roe: 12,       roa: 5,
    pe: 12,            pb: 1.4,        ps: 0.8,       ev_ebitda: 7,   ev_sales: 0.9,
    revenueGrowth3y: 8,  epsGrowth3y: 14,
    debtToEquity: 0.85, currentRatio: 1.2, interestCoverage: 6,
    assetTurnover: 0.72, inventoryTurnover: 5.4, receivablesDays: 42,
    fcfMargin: 5, dividendYield: 2.2, payoutRatio: 25,
  },

  Realty: {
    grossMargin: 35,   opMargin: 22,   netMargin: 14,
    ebitdaMargin: 28,  roic: 12,       roe: 14,       roa: 5,
    pe: 32,            pb: 4.8,        ps: 4.2,       ev_ebitda: 18,  ev_sales: 3.8,
    revenueGrowth3y: 28, epsGrowth3y: 45,
    debtToEquity: 0.75, currentRatio: 2.8, interestCoverage: 8,
    assetTurnover: 0.28, inventoryTurnover: 1.2, receivablesDays: 42,
    fcfMargin: 8, dividendYield: 0.5, payoutRatio: 15,
  },

  Power: {
    grossMargin: 42,   opMargin: 22,   netMargin: 12,
    ebitdaMargin: 28,  roic: 8,        roe: 12,       roa: 4,
    pe: 18,            pb: 2.2,        ps: 2.4,       ev_ebitda: 12,  ev_sales: 2.8,
    revenueGrowth3y: 12, epsGrowth3y: 18,
    debtToEquity: 1.80, currentRatio: 0.95, interestCoverage: 4,
    assetTurnover: 0.22, inventoryTurnover: 0, receivablesDays: 65,
    fcfMargin: 6, dividendYield: 2.4, payoutRatio: 35,
  },

  Insurance: {
    grossMargin: 28,   opMargin: 14,   netMargin: 10,
    ebitdaMargin: 18,  roic: 12,       roe: 14,       roa: 2,
    pe: 24,            pb: 3.4,        ps: 1.8,       ev_ebitda: 14,  ev_sales: 1.6,
    revenueGrowth3y: 14, epsGrowth3y: 18,
    debtToEquity: 5.50, currentRatio: 1.2, interestCoverage: 5,
    assetTurnover: 0.12, inventoryTurnover: 0, receivablesDays: 0,
    fcfMargin: 8, dividendYield: 1.0, payoutRatio: 22,
  },
};

// -------------------------------------------------------
// DCF Assumptions by sector (for valuation engine)
// -------------------------------------------------------
export interface SectorDCFParams {
  wacc: number;           // Weighted Average Cost of Capital
  terminalGrowth: number; // Terminal growth rate
  stage1Years: number;    // High-growth phase years
  stage1Growth: number;   // Stage 1 revenue growth
  stage2Years: number;    // Transition phase years
  stage2Growth: number;   // Stage 2 revenue growth
  taxRate: number;        // Effective tax rate
  reinvestmentRate: number; // % of NOPAT reinvested
}

export const SECTOR_DCF_PARAMS: Record<string, SectorDCFParams> = {
  IT:            { wacc:0.115, terminalGrowth:0.040, stage1Years:5, stage1Growth:0.12, stage2Years:5, stage2Growth:0.08, taxRate:0.25, reinvestmentRate:0.30 },
  Financials:    { wacc:0.130, terminalGrowth:0.050, stage1Years:5, stage1Growth:0.16, stage2Years:5, stage2Growth:0.10, taxRate:0.25, reinvestmentRate:0.65 },
  FMCG:          { wacc:0.110, terminalGrowth:0.045, stage1Years:5, stage1Growth:0.10, stage2Years:5, stage2Growth:0.07, taxRate:0.25, reinvestmentRate:0.25 },
  Pharma:        { wacc:0.120, terminalGrowth:0.040, stage1Years:5, stage1Growth:0.12, stage2Years:5, stage2Growth:0.08, taxRate:0.22, reinvestmentRate:0.35 },
  Auto:          { wacc:0.125, terminalGrowth:0.040, stage1Years:5, stage1Growth:0.10, stage2Years:5, stage2Growth:0.06, taxRate:0.25, reinvestmentRate:0.50 },
  Energy:        { wacc:0.120, terminalGrowth:0.035, stage1Years:5, stage1Growth:0.08, stage2Years:5, stage2Growth:0.05, taxRate:0.28, reinvestmentRate:0.55 },
  Telecom:       { wacc:0.130, terminalGrowth:0.045, stage1Years:5, stage1Growth:0.14, stage2Years:5, stage2Growth:0.09, taxRate:0.25, reinvestmentRate:0.60 },
  Construction:  { wacc:0.130, terminalGrowth:0.045, stage1Years:5, stage1Growth:0.14, stage2Years:5, stage2Growth:0.08, taxRate:0.25, reinvestmentRate:0.55 },
  Consumer:      { wacc:0.115, terminalGrowth:0.045, stage1Years:5, stage1Growth:0.18, stage2Years:5, stage2Growth:0.10, taxRate:0.25, reinvestmentRate:0.35 },
  Diversified:   { wacc:0.135, terminalGrowth:0.040, stage1Years:5, stage1Growth:0.18, stage2Years:5, stage2Growth:0.10, taxRate:0.25, reinvestmentRate:0.65 },
  Cement:        { wacc:0.125, terminalGrowth:0.040, stage1Years:5, stage1Growth:0.10, stage2Years:5, stage2Growth:0.06, taxRate:0.25, reinvestmentRate:0.50 },
  Metals:        { wacc:0.140, terminalGrowth:0.030, stage1Years:5, stage1Growth:0.08, stage2Years:5, stage2Growth:0.05, taxRate:0.28, reinvestmentRate:0.55 },
  Realty:        { wacc:0.130, terminalGrowth:0.045, stage1Years:5, stage1Growth:0.22, stage2Years:5, stage2Growth:0.12, taxRate:0.22, reinvestmentRate:0.55 },
  Power:         { wacc:0.115, terminalGrowth:0.040, stage1Years:5, stage1Growth:0.12, stage2Years:5, stage2Growth:0.07, taxRate:0.25, reinvestmentRate:0.65 },
  Insurance:     { wacc:0.125, terminalGrowth:0.045, stage1Years:5, stage1Growth:0.14, stage2Years:5, stage2Growth:0.09, taxRate:0.25, reinvestmentRate:0.60 },
};

// -------------------------------------------------------
// Graham Number upper P/E limits by sector
// -------------------------------------------------------
export const GRAHAM_PE_LIMITS: Record<string, number> = {
  IT:           22,
  Financials:   15,
  FMCG:         25,
  Pharma:       20,
  Auto:         18,
  Energy:       12,
  Telecom:      16,
  Construction: 18,
  Consumer:     28,
  Diversified:  15,
  Cement:       18,
  Metals:       10,
  Realty:       18,
  Power:        14,
  Insurance:    18,
};
