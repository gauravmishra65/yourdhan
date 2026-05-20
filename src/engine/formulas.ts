// ============================================================
//  YourDhan — Financial Scoring Engine
//  src/engine/formulas.ts
// ============================================================

// ─── Inline interfaces (avoids circular-dep with external type files) ────────

interface AnnualFinancials {
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

interface PriceHistory {
  date: string;
  close: number;
  volume: number;
}

interface StockMockData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function cagrCalc(v0: number, vN: number, N: number): number {
  if (N <= 0 || v0 <= 0 || vN <= 0) return 0;
  return Math.pow(vN / v0, 1 / N) - 1;
}

export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ─── Piotroski F-Score ────────────────────────────────────────────────────────

export function computePiotroski(f: AnnualFinancials[]): {
  score: number;
  signals: Record<string, 0 | 1>;
  label: string;
} {
  // Require at least 2 years
  if (f.length < 2) {
    return { score: 0, signals: {}, label: "Neutral" };
  }

  // Most-recent year = current, prior year = previous
  const cur = f[0];
  const prv = f[1];

  const avgAssetsCur =
    f.length >= 3 ? (cur.totalAssets + prv.totalAssets) / 2 : cur.totalAssets;
  const avgAssetsPrv =
    f.length >= 3
      ? (prv.totalAssets + f[2].totalAssets) / 2
      : prv.totalAssets;

  const roaCur = avgAssetsCur !== 0 ? cur.netIncome / avgAssetsCur : 0;
  const roaPrv = avgAssetsPrv !== 0 ? prv.netIncome / avgAssetsPrv : 0;

  const currentRatioCur =
    cur.currentLiabilities !== 0
      ? cur.currentAssets / cur.currentLiabilities
      : 0;
  const currentRatioPrv =
    prv.currentLiabilities !== 0
      ? prv.currentAssets / prv.currentLiabilities
      : 0;

  const grossMarginCur =
    cur.revenue !== 0 ? cur.grossProfit / cur.revenue : 0;
  const grossMarginPrv =
    prv.revenue !== 0 ? prv.grossProfit / prv.revenue : 0;

  const assetTurnoverCur =
    cur.totalAssets !== 0 ? cur.revenue / cur.totalAssets : 0;
  const assetTurnoverPrv =
    prv.totalAssets !== 0 ? prv.revenue / prv.totalAssets : 0;

  const signals: Record<string, 0 | 1> = {
    F1: cur.netIncome > 0 ? 1 : 0,
    F2: cur.operatingCashFlow > 0 ? 1 : 0,
    F3: roaCur > roaPrv ? 1 : 0,
    F4: cur.operatingCashFlow > cur.netIncome ? 1 : 0,
    F5: cur.longTermDebt < prv.longTermDebt ? 1 : 0,
    F6: currentRatioCur > currentRatioPrv ? 1 : 0,
    F7: cur.sharesOutstanding <= prv.sharesOutstanding ? 1 : 0,
    F8: grossMarginCur > grossMarginPrv ? 1 : 0,
    F9: assetTurnoverCur > assetTurnoverPrv ? 1 : 0,
  };

  const score = Object.values(signals).reduce((sum, v) => sum + v, 0 as number);
  const label = score >= 7 ? "Strong" : score >= 4 ? "Neutral" : "Weak";

  return { score, signals, label };
}

// ─── Altman Z-Score ───────────────────────────────────────────────────────────

export function computeAltmanZ(
  f: AnnualFinancials,
  marketCap: number
): {
  z: number;
  zone: string;
  X1: number;
  X2: number;
  X3: number;
  X4: number;
  X5: number;
} {
  const X1 =
    f.totalAssets !== 0
      ? (f.currentAssets - f.currentLiabilities) / f.totalAssets
      : 0;
  const X2 =
    f.totalAssets !== 0 ? f.retainedEarnings / f.totalAssets : 0;
  const X3 =
    f.totalAssets !== 0 ? f.operatingIncome / f.totalAssets : 0;
  const X4 =
    f.totalLiabilities !== 0 ? marketCap / f.totalLiabilities : 0;
  const X5 = f.totalAssets !== 0 ? f.revenue / f.totalAssets : 0;

  const z =
    1.2 * X1 + 1.4 * X2 + 3.3 * X3 + 0.6 * X4 + 1.0 * X5;

  const zone =
    z > 3.0
      ? "Safe Zone"
      : z > 1.81
      ? "Grey Zone"
      : "Distress Zone";

  return { z, zone, X1, X2, X3, X4, X5 };
}

// ─── Beneish M-Score ──────────────────────────────────────────────────────────

export function computeBeneish(
  t: AnnualFinancials,
  t1: AnnualFinancials
): {
  m: number;
  flag: boolean;
  components: Record<string, number>;
} {
  const grossMarginT =
    t.revenue !== 0 ? t.grossProfit / t.revenue : 0;
  const grossMarginT1 =
    t1.revenue !== 0 ? t1.grossProfit / t1.revenue : 0;

  const DSRI =
    t1.revenue !== 0 && t1.receivables !== 0
      ? t.receivables / t.revenue / (t1.receivables / t1.revenue)
      : 1;

  const GMI =
    grossMarginT !== 0 ? grossMarginT1 / grossMarginT : 1;

  const AQI =
    t1.totalAssets !== 0 && t.totalAssets !== 0
      ? (1 - (t.currentAssets + t.ppe) / t.totalAssets) /
        (1 - (t1.currentAssets + t1.ppe) / t1.totalAssets)
      : 1;

  const SGI = t1.revenue !== 0 ? t.revenue / t1.revenue : 1;

  const depRateT =
    t.ppe + t.depreciation !== 0
      ? t.depreciation / (t.ppe + t.depreciation)
      : 0;
  const depRateT1 =
    t1.ppe + t1.depreciation !== 0
      ? t1.depreciation / (t1.ppe + t1.depreciation)
      : 0;
  const DEPI = depRateT !== 0 ? depRateT1 / depRateT : 1;

  const SGAI =
    t1.sga !== 0 && t1.revenue !== 0 && t.revenue !== 0
      ? (t.sga / t.revenue) / (t1.sga / t1.revenue)
      : 1;

  const LVGI =
    t1.totalAssets !== 0 && t.totalAssets !== 0
      ? (t.longTermDebt + t.currentLiabilities) /
        t.totalAssets /
        ((t1.longTermDebt + t1.currentLiabilities) / t1.totalAssets)
      : 1;

  const TATA =
    t.totalAssets !== 0
      ? (t.netIncome - t.operatingCashFlow) / t.totalAssets
      : 0;

  const m =
    -4.84 +
    0.92 * DSRI +
    0.528 * GMI +
    0.404 * AQI +
    0.892 * SGI +
    0.115 * DEPI -
    0.172 * SGAI +
    4.679 * TATA -
    0.327 * LVGI;

  return {
    m,
    flag: m > -1.78,
    components: { DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA },
  };
}

// ─── WACC ─────────────────────────────────────────────────────────────────────

export function computeWACC(
  f: AnnualFinancials,
  marketCap: number,
  beta: number,
  riskFreeRate = 0.072,
  erp = 0.055
): number {
  const Ke = riskFreeRate + beta * erp;

  const taxRate =
    f.pretaxIncome !== 0
      ? Math.max(0, Math.min(0.5, f.incomeTaxExpense / f.pretaxIncome))
      : 0.21;

  const Kd =
    f.totalDebt > 0
      ? (f.interestExpense / f.totalDebt) * (1 - taxRate)
      : 0;

  const E = marketCap;
  const D = f.totalDebt;
  const V = E + D;

  if (V === 0) return Ke;

  return (E / V) * Ke + (D / V) * Kd;
}

// ─── DCF Two-Stage ────────────────────────────────────────────────────────────

export function computeDCF(params: {
  baseValue: number;
  g1: number;
  g2: number;
  wacc: number;
  stage1Years: number;
}): {
  intrinsicValue: number;
  marginOfSafety: number;
  pv1: number;
  pv2: number;
  yearlyPVs: Array<{ year: number; cf: number; pv: number }>;
} {
  const { baseValue, g1, g2, wacc, stage1Years } = params;

  const yearlyPVs: Array<{ year: number; cf: number; pv: number }> = [];
  let pv1 = 0;
  let cf = baseValue;

  for (let yr = 1; yr <= stage1Years; yr++) {
    cf = cf * (1 + g1);
    const pv = cf / Math.pow(1 + wacc, yr);
    yearlyPVs.push({ year: yr, cf, pv });
    pv1 += pv;
  }

  // Terminal value via Gordon Growth Model
  const terminalCF = cf * (1 + g2);
  const tv = wacc - g2 !== 0 ? terminalCF / (wacc - g2) : 0;
  const pv2 = tv / Math.pow(1 + wacc, stage1Years);

  const intrinsicValue = pv1 + pv2;
  const marginOfSafety =
    intrinsicValue !== 0 ? (intrinsicValue - baseValue) / intrinsicValue : 0;

  return { intrinsicValue, marginOfSafety, pv1, pv2, yearlyPVs };
}

// ─── GF Value ─────────────────────────────────────────────────────────────────

export function computeGFValue(params: {
  priceHistory: PriceHistory[];
  financials: AnnualFinancials[];
  currentPrice: number;
  analystEPS_year1: number;
  analystRevenue_year1: number;
  sharesOutstanding: number;
}): { gfValue: number; ratio: number; zone: string; rank: number } {
  const {
    priceHistory,
    financials,
    currentPrice,
    analystEPS_year1,
    sharesOutstanding,
  } = params;

  // Historical median P/E over available years
  const peRatios = financials
    .filter((f) => f.eps > 0 && priceHistory.length > 0)
    .map((f) => {
      const targetDate = `${f.year}-12-31`;
      const closest = priceHistory.reduce((prev, cur) =>
        Math.abs(
          new Date(cur.date).getTime() - new Date(targetDate).getTime()
        ) <
        Math.abs(
          new Date(prev.date).getTime() - new Date(targetDate).getTime()
        )
          ? cur
          : prev
      );
      return closest.close / f.eps;
    })
    .filter((pe) => pe > 0 && pe < 200);

  const medPE = peRatios.length > 0 ? median(peRatios) : 15;

  // Forward EPS for intrinsic value estimation
  const epsForward =
    analystEPS_year1 > 0 ? analystEPS_year1 : financials[0]?.eps ?? 0;

  const bvps =
    sharesOutstanding > 0
      ? (financials[0]?.totalEquity ?? 0) / sharesOutstanding
      : financials[0]?.bookValuePerShare ?? 0;

  const intrinsicByPE = medPE * epsForward;
  const intrinsicByBV = 1.5 * bvps; // conservative P/B anchor

  // Weight: 70% earnings-based, 30% book-value
  const gfValue =
    intrinsicByPE > 0 && intrinsicByBV > 0
      ? 0.7 * intrinsicByPE + 0.3 * intrinsicByBV
      : intrinsicByPE > 0
      ? intrinsicByPE
      : intrinsicByBV;

  const ratio = gfValue > 0 ? currentPrice / gfValue : 1;

  const zone =
    ratio < 0.7
      ? "Significantly Undervalued"
      : ratio < 0.9
      ? "Modestly Undervalued"
      : ratio < 1.1
      ? "Fairly Valued"
      : ratio < 1.3
      ? "Modestly Overvalued"
      : "Significantly Overvalued";

  // Rank 1-10: lower ratio → higher rank
  const rank = clamp(Math.round(10 * (1 - (ratio - 0.5) / 1.0)), 1, 10);

  return { gfValue, ratio, zone, rank };
}

// ─── Momentum Rank ────────────────────────────────────────────────────────────

export function computeMomentumRank(
  priceHistory: PriceHistory[],
  currentPrice: number
): {
  rank: number;
  ret_1m: number;
  ret_3m: number;
  ret_6m: number;
  ret_12m: number;
} {
  const sorted = [...priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const priceNDaysAgo = (n: number): number => {
    const target = Date.now() - n * 24 * 60 * 60 * 1000;
    const candidate = sorted.reduce((prev, cur) =>
      Math.abs(new Date(cur.date).getTime() - target) <
      Math.abs(new Date(prev.date).getTime() - target)
        ? cur
        : prev
    );
    return candidate.close;
  };

  const p1m = priceNDaysAgo(30);
  const p3m = priceNDaysAgo(90);
  const p6m = priceNDaysAgo(180);
  const p12m = priceNDaysAgo(365);

  const ret = (past: number) =>
    past > 0 ? (currentPrice - past) / past : 0;

  const ret_1m = ret(p1m);
  const ret_3m = ret(p3m);
  const ret_6m = ret(p6m);
  const ret_12m = ret(p12m);

  // Composite momentum using weighted returns (skip last month = standard)
  const composite =
    0.1 * ret_1m + 0.2 * ret_3m + 0.3 * ret_6m + 0.4 * ret_12m;

  // Map to rank 1-10: composite range assumed [-0.5, +1.0]
  const normalised = (composite + 0.5) / 1.5;
  const rank = clamp(Math.round(normalised * 9) + 1, 1, 10);

  return { rank, ret_1m, ret_3m, ret_6m, ret_12m };
}

// ─── Sub-rank: Financial Strength ────────────────────────────────────────────

export function computeFinancialStrengthRank(
  f: AnnualFinancials,
  piotroskiF: number,
  altmanZ: number
): number {
  let score = 0;

  // Piotroski component (0-3 pts)
  score += (piotroskiF / 9) * 3;

  // Altman Z component (0-2 pts)
  const zScore = clamp(altmanZ, 0, 6);
  score += (zScore / 6) * 2;

  // Current ratio (0-1 pt)
  const cr =
    f.currentLiabilities !== 0
      ? f.currentAssets / f.currentLiabilities
      : 0;
  score += cr >= 2 ? 1 : cr >= 1 ? 0.5 : 0;

  // Debt/Equity (0-1 pt)
  const de =
    f.totalEquity !== 0 ? f.totalDebt / f.totalEquity : 999;
  score += de < 0.5 ? 1 : de < 1.5 ? 0.5 : 0;

  // Interest coverage (0-1 pt)
  const ic =
    f.interestExpense !== 0 ? f.operatingIncome / f.interestExpense : 0;
  score += ic >= 5 ? 1 : ic >= 2 ? 0.5 : 0;

  // Positive FCF (0-1 pt)
  score += f.freeCashFlow > 0 ? 1 : 0;

  // Positive retained earnings (0-1 pt)
  score += f.retainedEarnings > 0 ? 1 : 0;

  // Max possible: 3+2+1+1+1+1+1 = 10
  return clamp(Math.round((score / 10) * 10), 1, 10);
}

// ─── Sub-rank: Profitability ──────────────────────────────────────────────────

export function computeProfitabilityRank(
  financials: AnnualFinancials[],
  sector: string
): number {
  if (financials.length === 0) return 1;

  const f = financials[0];
  let score = 0;

  // Net margin (0-2 pts)
  const nm = f.revenue !== 0 ? f.netIncome / f.revenue : 0;
  score += nm > 0.2 ? 2 : nm > 0.1 ? 1.5 : nm > 0.05 ? 1 : nm > 0 ? 0.5 : 0;

  // Operating margin (0-2 pts)
  const om = f.revenue !== 0 ? f.operatingIncome / f.revenue : 0;
  score += om > 0.25 ? 2 : om > 0.15 ? 1.5 : om > 0.08 ? 1 : om > 0 ? 0.5 : 0;

  // ROE (0-1.5 pts)
  const roe = f.totalEquity !== 0 ? f.netIncome / f.totalEquity : 0;
  score += roe > 0.2 ? 1.5 : roe > 0.1 ? 1 : roe > 0 ? 0.5 : 0;

  // ROA (0-1 pt)
  const roa = f.totalAssets !== 0 ? f.netIncome / f.totalAssets : 0;
  score += roa > 0.1 ? 1 : roa > 0.05 ? 0.5 : 0;

  // Gross margin (0-1 pt)
  const gm = f.revenue !== 0 ? f.grossProfit / f.revenue : 0;
  score += gm > 0.5 ? 1 : gm > 0.3 ? 0.7 : gm > 0.15 ? 0.4 : 0;

  // Consistency: profitable every available year (0-1.5 pts)
  const alwaysProfitable = financials.every((yr) => yr.netIncome > 0);
  score += alwaysProfitable ? 1.5 : 0;

  // sector param reserved for future sector-relative adjustments
  void sector;

  const maxScore = 9;
  return clamp(Math.round((score / maxScore) * 9) + 1, 1, 10);
}

// ─── Sub-rank: Growth ─────────────────────────────────────────────────────────

export function computeGrowthRank(financials: AnnualFinancials[]): number {
  if (financials.length < 2) return 5;

  const newest = financials[0];
  const oldest = financials[financials.length - 1];
  const N = newest.year - oldest.year;

  if (N <= 0) return 5;

  const revCAGR = cagrCalc(oldest.revenue, newest.revenue, N);
  const epsCAGR =
    oldest.eps > 0 && newest.eps > 0
      ? cagrCalc(oldest.eps, newest.eps, N)
      : 0;
  const fcfCAGR =
    oldest.freeCashFlow > 0 && newest.freeCashFlow > 0
      ? cagrCalc(oldest.freeCashFlow, newest.freeCashFlow, N)
      : 0;

  let score = 0;

  // Revenue CAGR (0-3 pts)
  score +=
    revCAGR > 0.15
      ? 3
      : revCAGR > 0.1
      ? 2.5
      : revCAGR > 0.05
      ? 2
      : revCAGR > 0
      ? 1
      : 0;

  // EPS CAGR (0-3 pts)
  score +=
    epsCAGR > 0.15
      ? 3
      : epsCAGR > 0.1
      ? 2.5
      : epsCAGR > 0.05
      ? 2
      : epsCAGR > 0
      ? 1
      : 0;

  // FCF CAGR (0-2 pts)
  score +=
    fcfCAGR > 0.1 ? 2 : fcfCAGR > 0.05 ? 1.5 : fcfCAGR > 0 ? 1 : 0;

  // Consecutive revenue growth years (0-2 pts)
  let consec = 0;
  for (let i = 0; i < financials.length - 1; i++) {
    if (financials[i].revenue > financials[i + 1].revenue) consec++;
    else break;
  }
  score += consec >= 3 ? 2 : consec >= 2 ? 1 : 0;

  const maxScore = 10;
  return clamp(Math.round((score / maxScore) * 9) + 1, 1, 10);
}

// ─── GF Score (composite) ────────────────────────────────────────────────────

export function computeGFScore(ranks: {
  financialStrength: number;
  profitability: number;
  growth: number;
  value: number;
  momentum: number;
}): { score: number; label: string } {
  const { financialStrength, profitability, growth, value, momentum } = ranks;

  const weighted =
    financialStrength * 0.16 +
    profitability * 0.24 +
    growth * 0.24 +
    value * 0.2 +
    momentum * 0.16;

  const score = Math.round(weighted * 10);
  const label =
    score >= 90
      ? "Outstanding"
      : score >= 80
      ? "Good"
      : score >= 70
      ? "Fair"
      : score >= 60
      ? "Warning"
      : "Poor";

  return { score, label };
}

// ─── Warning & Good Signs ─────────────────────────────────────────────────────

export function computeSigns(
  stock: StockMockData,
  scores: {
    piotroskiF?: number;
    altmanZ?: number;
    beneishFlag?: boolean;
    gfValueRatio?: number;
    gfScore?: number;
    roic?: number;
    wacc?: number;
  }
): { warnings: string[]; goods: string[] } {
  const warnings: string[] = [];
  const goods: string[] = [];
  const f = stock.financials;

  if (f.length === 0) return { warnings, goods };

  const cur = f[0];
  const prv = f.length > 1 ? f[1] : null;
  const f2 = f.length > 2 ? f[2] : null;

  // ── Warning Signs ──────────────────────────────────────────────────────────

  // WS1: Revenue declining 3 consecutive years
  if (
    f.length >= 3 &&
    f[0].revenue < f[1].revenue &&
    f[1].revenue < f[2].revenue
  ) {
    warnings.push("WS1: Revenue has declined for 3 consecutive years");
  }

  // WS2: Negative FCF
  if (cur.freeCashFlow < 0) {
    warnings.push("WS2: Negative free cash flow");
  }

  // WS3: Beneish manipulation flag
  if (scores.beneishFlag === true) {
    warnings.push(
      "WS3: Beneish M-Score suggests possible earnings manipulation"
    );
  }

  // WS4: Altman Z distress
  if (scores.altmanZ !== undefined && scores.altmanZ < 1.81) {
    warnings.push(
      `WS4: Altman Z-Score (${scores.altmanZ.toFixed(2)}) in distress zone`
    );
  }

  // WS5: Piotroski < 3
  if (scores.piotroskiF !== undefined && scores.piotroskiF < 3) {
    warnings.push(`WS5: Piotroski F-Score (${scores.piotroskiF}) is very weak`);
  }

  // WS6: Heavy insider selling
  if (stock.netSharesSold_12m > 500_000) {
    warnings.push(
      "WS6: Heavy insider selling — >500K net shares sold in last 12 months"
    );
  }

  // WS7: Debt growing >20% while margins declining
  if (prv !== null) {
    const debtGrowth =
      prv.totalDebt > 0
        ? (cur.totalDebt - prv.totalDebt) / prv.totalDebt
        : 0;
    const opMarginCur =
      cur.revenue !== 0 ? cur.operatingIncome / cur.revenue : 0;
    const opMarginPrv =
      prv.revenue !== 0 ? prv.operatingIncome / prv.revenue : 0;
    if (debtGrowth > 0.2 && opMarginCur < opMarginPrv) {
      warnings.push(
        "WS7: Total debt grew >20% while operating margins declined"
      );
    }
  }

  // WS8: Revenue per share declined >5% YoY
  if (prv !== null) {
    const rpsCur =
      cur.sharesOutstanding > 0 ? cur.revenue / cur.sharesOutstanding : 0;
    const rpsPrv =
      prv.sharesOutstanding > 0 ? prv.revenue / prv.sharesOutstanding : 0;
    if (rpsPrv > 0 && (rpsCur - rpsPrv) / rpsPrv < -0.05) {
      warnings.push("WS8: Revenue per share declined >5% year-over-year");
    }
  }

  // WS9: Gross margin declined >3% over 2 years
  if (f2 !== null) {
    const gmCur = cur.revenue !== 0 ? cur.grossProfit / cur.revenue : 0;
    const gmOld = f2.revenue !== 0 ? f2.grossProfit / f2.revenue : 0;
    if (gmOld - gmCur > 0.03) {
      warnings.push(
        "WS9: Gross margin declined more than 3% over the last 2 years"
      );
    }
  }

  // WS10: Stock significantly overvalued vs GF Value (>130%)
  if (scores.gfValueRatio !== undefined && scores.gfValueRatio > 1.3) {
    warnings.push(
      `WS10: Stock is significantly overvalued — trading at ${(scores.gfValueRatio * 100).toFixed(0)}% of GF Value`
    );
  }

  // WS11: Dividend cut vs prior year
  if (
    prv !== null &&
    prv.dividendPerShare > 0 &&
    cur.dividendPerShare < prv.dividendPerShare
  ) {
    warnings.push(
      "WS11: Dividend per share was cut versus the prior year"
    );
  }

  // WS12: ROIC below WACC
  if (
    scores.roic !== undefined &&
    scores.wacc !== undefined &&
    scores.roic < scores.wacc
  ) {
    warnings.push(
      `WS12: ROIC (${(scores.roic * 100).toFixed(1)}%) is below WACC (${(scores.wacc * 100).toFixed(1)}%) — destroying value`
    );
  }

  // ── Good Signs ─────────────────────────────────────────────────────────────

  // GS1: 3+ insiders bought in 90 days
  if (stock.insiderBuys_90d >= 3) {
    goods.push(
      `GS1: ${stock.insiderBuys_90d} insiders purchased shares in the last 90 days`
    );
  }

  // GS2: 3+ institutions added position
  if (stock.gurusAdded_quarter >= 3) {
    goods.push(
      `GS2: ${stock.gurusAdded_quarter} institutional investors added positions this quarter`
    );
  }

  // GS4: Revenue growth accelerating
  if (f.length >= 3) {
    const growth1 =
      f[1].revenue > 0 ? (f[0].revenue - f[1].revenue) / f[1].revenue : 0;
    const growth2 =
      f[2].revenue > 0 ? (f[1].revenue - f[2].revenue) / f[2].revenue : 0;
    if (growth1 > growth2 && growth1 > 0) {
      goods.push("GS4: Revenue growth is accelerating year-over-year");
    }
  }

  // GS5: Operating margin expanded >2% over 2 years
  if (f2 !== null) {
    const omCur =
      cur.revenue !== 0 ? cur.operatingIncome / cur.revenue : 0;
    const omOld =
      f2.revenue !== 0 ? f2.operatingIncome / f2.revenue : 0;
    if (omCur - omOld > 0.02) {
      goods.push(
        "GS5: Operating margin expanded more than 2% over the last 2 years"
      );
    }
  }

  // GS6: ROIC > WACC + 3%
  if (
    scores.roic !== undefined &&
    scores.wacc !== undefined &&
    scores.roic > scores.wacc + 0.03
  ) {
    goods.push(
      `GS6: ROIC (${(scores.roic * 100).toFixed(1)}%) exceeds WACC by more than 3% — creating shareholder value`
    );
  }

  // GS7: Near 52-week low with GF Score > 70
  if (stock.priceHistory.length > 0 && (scores.gfScore ?? 0) > 70) {
    const closes = stock.priceHistory.map((p) => p.close);
    const low52w = Math.min(...closes);
    const high52w = Math.max(...closes);
    const range = high52w - low52w;
    if (range > 0 && (stock.currentPrice - low52w) / range < 0.2) {
      goods.push(
        "GS7: Stock is near its 52-week low while GF Score remains above 70"
      );
    }
  }

  // GS8: 10+ consecutive dividend growth years
  if (stock.consecutiveDividendGrowthYears >= 10) {
    goods.push(
      `GS8: ${stock.consecutiveDividendGrowthYears} consecutive years of dividend growth (Dividend Aristocrat territory)`
    );
  }

  // GS9: Share buybacks — shares reduced >3% over 2 years
  if (f2 !== null && f2.sharesOutstanding > 0) {
    const reduction =
      (f2.sharesOutstanding - cur.sharesOutstanding) /
      f2.sharesOutstanding;
    if (reduction > 0.03) {
      goods.push(
        `GS9: Shares outstanding reduced by ${(reduction * 100).toFixed(1)}% over 2 years — active buyback programme`
      );
    }
  }

  // GS10: Piotroski >= 7
  if (scores.piotroskiF !== undefined && scores.piotroskiF >= 7) {
    goods.push(
      `GS10: Piotroski F-Score of ${scores.piotroskiF} indicates strong financial health`
    );
  }

  return { warnings, goods };
}

// ─── StockScores interface ────────────────────────────────────────────────────

export interface StockScores {
  ticker: string;
  financialStrengthRank: number;
  profitabilityRank: number;
  growthRank: number;
  valueRank: number;
  momentumRank: number;
  gfScore: number;
  gfScoreLabel: string;
  piotroskiF: number;
  piotroskiLabel: string;
  altmanZ: number;
  altmanZone: string;
  beneishM: number;
  beneishFlag: boolean;
  gfValue: number;
  gfValueRatio: number;
  gfValueZone: string;
  dcfValue: number;
  marginOfSafety: number;
  wacc: number;
  pe: number;
  pb: number;
  ps: number;
  pfcf: number;
  evEbitda: number;
  roe: number;
  roa: number;
  roic: number;
  currentRatio: number;
  quickRatio: number;
  debtEquity: number;
  interestCoverage: number;
  grossMargin: number;
  opMargin: number;
  netMargin: number;
  dividendYield: number;
  payoutRatio: number;
  assetTurnover: number;
  benGrahamNumber: number;
  peg: number;
  ret_1m: number;
  ret_3m: number;
  ret_6m: number;
  ret_12m: number;
  warningSigns: string[];
  goodSigns: string[];
}

// ─── Master computation function ──────────────────────────────────────────────

export function computeAllScores(stock: StockMockData): StockScores {
  const { financials, priceHistory, currentPrice, marketCap, beta } = stock;

  const f = financials[0];
  const prv = financials.length > 1 ? financials[1] : null;

  // ── Piotroski ──
  const piotroski = computePiotroski(financials);

  // ── Altman Z ──
  const altman = computeAltmanZ(f, marketCap);

  // ── Beneish ──
  let beneishM = 0;
  let beneishFlag = false;
  if (prv) {
    const beneish = computeBeneish(f, prv);
    beneishM = beneish.m;
    beneishFlag = beneish.flag;
  }

  // ── WACC ──
  const wacc = computeWACC(f, marketCap, beta);

  // ── ROIC ──
  const taxRate =
    f.pretaxIncome > 0
      ? Math.max(0, Math.min(0.5, f.incomeTaxExpense / f.pretaxIncome))
      : 0.21;
  const investedCapital = f.totalEquity + f.totalDebt - f.cash;
  const nopat = f.operatingIncome * (1 - taxRate);
  const roic = investedCapital > 0 ? nopat / investedCapital : 0;

  // ── DCF ──
  const N = financials.length - 1;
  const revCAGR =
    N > 0
      ? cagrCalc(
          financials[financials.length - 1].revenue,
          f.revenue,
          N
        )
      : 0.05;
  const g1 = clamp(revCAGR, 0.01, 0.25);
  const g2 = clamp(wacc - 0.02, 0.01, 0.04);
  const baseFCF = f.freeCashFlow > 0 ? f.freeCashFlow : f.operatingCashFlow;
  const dcf = computeDCF({
    baseValue: baseFCF,
    g1,
    g2,
    wacc,
    stage1Years: 10,
  });

  const sharesOut = f.sharesOutstanding > 0 ? f.sharesOutstanding : 1;
  const dcfValue = dcf.intrinsicValue / sharesOut;
  const marginOfSafety =
    dcfValue > 0 ? (dcfValue - currentPrice) / dcfValue : 0;

  // ── GF Value ──
  const gfValResult = computeGFValue({
    priceHistory,
    financials,
    currentPrice,
    analystEPS_year1: stock.analystEPS_year1,
    analystRevenue_year1: stock.analystRevenue_year1,
    sharesOutstanding: sharesOut,
  });

  // ── Momentum ──
  const momentum = computeMomentumRank(priceHistory, currentPrice);

  // ── Sub-ranks ──
  const fsRank = computeFinancialStrengthRank(f, piotroski.score, altman.z);
  const profRank = computeProfitabilityRank(financials, stock.sector);
  const growthRankVal = computeGrowthRank(financials);

  // ── GF Score ──
  const gfScoreResult = computeGFScore({
    financialStrength: fsRank,
    profitability: profRank,
    growth: growthRankVal,
    value: gfValResult.rank,
    momentum: momentum.rank,
  });

  // ── Valuation Multiples ──
  const pe = f.eps > 0 ? currentPrice / f.eps : 0;
  const pb = f.bookValuePerShare > 0 ? currentPrice / f.bookValuePerShare : 0;
  const ps = sharesOut > 0 ? currentPrice / (f.revenue / sharesOut) : 0;
  const pfcf =
    f.freeCashFlow > 0 ? currentPrice / (f.freeCashFlow / sharesOut) : 0;
  const ev = marketCap + f.totalDebt - f.cash;
  const evEbitda = f.ebitda > 0 ? ev / f.ebitda : 0;

  // ── Quality Ratios ──
  const roe = f.totalEquity !== 0 ? f.netIncome / f.totalEquity : 0;
  const roa = f.totalAssets !== 0 ? f.netIncome / f.totalAssets : 0;
  const currentRatio =
    f.currentLiabilities !== 0
      ? f.currentAssets / f.currentLiabilities
      : 0;
  const quickRatio =
    f.currentLiabilities !== 0
      ? (f.currentAssets - f.inventory) / f.currentLiabilities
      : 0;
  const debtEquity =
    f.totalEquity !== 0 ? f.totalDebt / f.totalEquity : 0;
  const interestCoverage =
    f.interestExpense !== 0 ? f.operatingIncome / f.interestExpense : 0;
  const grossMargin = f.revenue !== 0 ? f.grossProfit / f.revenue : 0;
  const opMargin =
    f.revenue !== 0 ? f.operatingIncome / f.revenue : 0;
  const netMargin = f.revenue !== 0 ? f.netIncome / f.revenue : 0;
  const dividendYield =
    currentPrice > 0 ? f.dividendPerShare / currentPrice : 0;
  const payoutRatio = f.eps > 0 ? f.dividendPerShare / f.eps : 0;
  const assetTurnover =
    f.totalAssets !== 0 ? f.revenue / f.totalAssets : 0;

  // ── Ben Graham Number: √(22.5 × EPS × BVPS) ──
  const benGrahamNumber =
    f.eps > 0 && f.bookValuePerShare > 0
      ? Math.sqrt(22.5 * f.eps * f.bookValuePerShare)
      : 0;

  // ── PEG ratio ──
  const epsFirst = financials[financials.length - 1].eps;
  const epsCAGRPct =
    N > 0 && epsFirst > 0 && f.eps > 0
      ? cagrCalc(epsFirst, f.eps, N) * 100
      : 5;
  const peg = epsCAGRPct > 0 && pe > 0 ? pe / epsCAGRPct : 0;

  // ── Signs ──
  const { warnings: warningSigns, goods: goodSigns } = computeSigns(stock, {
    piotroskiF: piotroski.score,
    altmanZ: altman.z,
    beneishFlag,
    gfValueRatio: gfValResult.ratio,
    gfScore: gfScoreResult.score,
    roic,
    wacc,
  });

  return {
    ticker: stock.ticker,
    financialStrengthRank: fsRank,
    profitabilityRank: profRank,
    growthRank: growthRankVal,
    valueRank: gfValResult.rank,
    momentumRank: momentum.rank,
    gfScore: gfScoreResult.score,
    gfScoreLabel: gfScoreResult.label,
    piotroskiF: piotroski.score,
    piotroskiLabel: piotroski.label,
    altmanZ: altman.z,
    altmanZone: altman.zone,
    beneishM,
    beneishFlag,
    gfValue: gfValResult.gfValue,
    gfValueRatio: gfValResult.ratio,
    gfValueZone: gfValResult.zone,
    dcfValue,
    marginOfSafety,
    wacc,
    pe,
    pb,
    ps,
    pfcf,
    evEbitda,
    roe,
    roa,
    roic,
    currentRatio,
    quickRatio,
    debtEquity,
    interestCoverage,
    grossMargin,
    opMargin,
    netMargin,
    dividendYield,
    payoutRatio,
    assetTurnover,
    benGrahamNumber,
    peg,
    ret_1m: momentum.ret_1m,
    ret_3m: momentum.ret_3m,
    ret_6m: momentum.ret_6m,
    ret_12m: momentum.ret_12m,
    warningSigns,
    goodSigns,
  };
}
