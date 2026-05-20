// ============================================================
// YourDhan – Finance Utilities
// Pure TypeScript financial formula library (63+ functions)
// ============================================================

// ---------------------
// Internal helper
// ---------------------

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/** Project weights onto the probability simplex (non-negative, sum to 1). */
function simplexProject(weights: number[]): number[] {
  const n = weights.length;
  const w = weights.map((v) => Math.max(v, 0));
  const total = w.reduce((s, v) => s + v, 0);
  if (total === 0) return Array(n).fill(1 / n);
  return w.map((v) => v / total);
}

// ============================================================
// A. RETURNS
// ============================================================

/** 1. Simple point-to-point return */
export function simpleReturn(pStart: number, pEnd: number): number {
  if (pStart === 0) return 0;
  return (pEnd - pStart) / pStart;
}

/** 2. Total return including dividends */
export function totalReturn(
  pStart: number,
  pEnd: number,
  dividends: number
): number {
  if (pStart === 0) return 0;
  return (pEnd + dividends - pStart) / pStart;
}

/** 3. Compound Annual Growth Rate */
export function cagr(pStart: number, pEnd: number, years: number): number {
  if (pStart === 0 || years === 0) return 0;
  return Math.pow(pEnd / pStart, 1 / years) - 1;
}

/** 4. Logarithmic (continuously compounded) return */
export function logReturn(pPrev: number, pCurr: number): number {
  if (pPrev <= 0 || pCurr <= 0) return 0;
  return Math.log(pCurr / pPrev);
}

/** 5. Weighted return: sum of w_i * r_i */
export function weightedReturn(weights: number[], returns: number[]): number {
  const n = Math.min(weights.length, returns.length);
  let result = 0;
  for (let i = 0; i < n; i++) result += weights[i] * returns[i];
  return result;
}

/** 6. Annualize a series of monthly returns */
export function annualizeMonthly(monthlyReturns: number[]): number {
  const n = monthlyReturns.length;
  if (n === 0) return 0;
  const product = monthlyReturns.reduce((p, r) => p * (1 + r), 1);
  return Math.pow(product, 12 / n) - 1;
}

/** 7. Rolling compounded return over a sliding window */
export function rollingReturn(returns: number[], window: number): number[] {
  if (window <= 0 || returns.length < window) return [];
  const result: number[] = [];
  for (let i = 0; i <= returns.length - window; i++) {
    const slice = returns.slice(i, i + window);
    const compounded = slice.reduce((p, r) => p * (1 + r), 1) - 1;
    result.push(compounded);
  }
  return result;
}

// ============================================================
// B. RISK
// ============================================================

/** 8. Annualized standard deviation */
export function annualizedStdDev(
  returns: number[],
  frequency: "daily" | "monthly"
): number {
  const factor = frequency === "daily" ? Math.sqrt(252) : Math.sqrt(12);
  return stdDev(returns) * factor;
}

/** 9. Downside deviation (relative to a target return, default 0) */
export function downsideDeviation(
  returns: number[],
  targetReturn = 0
): number {
  if (returns.length === 0) return 0;
  const squaredShortfalls = returns.map((r) => Math.pow(Math.min(r - targetReturn, 0), 2));
  return Math.sqrt(mean(squaredShortfalls));
}

/** 10. Ulcer Index — measures depth and duration of drawdowns */
export function ulcerIndex(prices: number[]): number {
  if (prices.length === 0) return 0;
  let peak = prices[0];
  const drawdowns: number[] = [];
  for (const p of prices) {
    if (p > peak) peak = p;
    const d = peak > 0 ? ((p - peak) / peak) * 100 : 0;
    drawdowns.push(d);
  }
  return Math.sqrt(mean(drawdowns.map((d) => d * d)));
}

/** 11. Semi-variance — variance of returns below the mean */
export function semiVariance(returns: number[]): number {
  if (returns.length === 0) return 0;
  const m = mean(returns);
  const negDeviations = returns.map((r) => Math.pow(Math.min(r - m, 0), 2));
  return mean(negDeviations);
}

// ============================================================
// C. RISK-ADJUSTED RATIOS
// ============================================================

/** 12. Sharpe Ratio */
export function sharpeRatio(
  annReturn: number,
  annStdDev: number,
  riskFreeRate = 0
): number {
  if (annStdDev === 0) return 0;
  return (annReturn - riskFreeRate) / annStdDev;
}

/** 13. Sortino Ratio */
export function sortinoRatio(
  annReturn: number,
  downsideDev: number,
  riskFreeRate = 0
): number {
  if (downsideDev === 0) return 0;
  return (annReturn - riskFreeRate) / downsideDev;
}

/** 14. Treynor Ratio */
export function treynorRatio(
  annReturn: number,
  beta: number,
  riskFreeRate = 0
): number {
  if (beta === 0) return 0;
  return (annReturn - riskFreeRate) / beta;
}

/** 15. Calmar Ratio */
export function calmarRatio(cagrVal: number, maxDrawdownVal: number): number {
  if (maxDrawdownVal === 0) return 0;
  return cagrVal / Math.abs(maxDrawdownVal);
}

/** 16. Omega Ratio */
export function omegaRatio(returns: number[], threshold = 0): number {
  let gains = 0;
  let losses = 0;
  for (const r of returns) {
    if (r > threshold) gains += r - threshold;
    else losses += threshold - r;
  }
  if (losses === 0) return gains === 0 ? 1 : Infinity;
  return gains / losses;
}

/** 17. Martin Ratio (Ulcer Performance Index) */
export function martinRatio(
  annReturn: number,
  ulcerIdx: number,
  riskFreeRate = 0
): number {
  if (ulcerIdx === 0) return 0;
  return (annReturn - riskFreeRate) / ulcerIdx;
}

/** 18. Information Ratio */
export function informationRatio(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  const n = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (n === 0) return 0;
  const diffs = Array.from({ length: n }, (_, i) => portfolioReturns[i] - benchmarkReturns[i]);
  const te = stdDev(diffs);
  if (te === 0) return 0;
  return mean(diffs) / te;
}

/** 19. Modigliani Risk-Adjusted Performance (M²) */
export function modigliani(
  sharpe: number,
  marketStdDev: number,
  riskFreeRate: number
): number {
  return sharpe * marketStdDev + riskFreeRate;
}

// ============================================================
// D. DRAWDOWN
// ============================================================

/** 20. Full drawdown series as fractions */
export function drawdownSeries(prices: number[]): number[] {
  if (prices.length === 0) return [];
  let peak = prices[0];
  return prices.map((p) => {
    if (p > peak) peak = p;
    return peak > 0 ? (p - peak) / peak : 0;
  });
}

/** 21. Maximum drawdown (most negative value in the series) */
export function maxDrawdown(prices: number[]): number {
  const dd = drawdownSeries(prices);
  if (dd.length === 0) return 0;
  return Math.min(...dd);
}

/** 22. Duration of the longest drawdown period */
export function maxDrawdownDuration(prices: number[]): {
  start: number;
  end: number;
  durationDays: number;
} {
  if (prices.length === 0) return { start: 0, end: 0, durationDays: 0 };
  const dd = drawdownSeries(prices);
  let bestStart = 0;
  let bestEnd = 0;
  let bestDuration = 0;
  let currentStart = 0;
  let inDrawdown = false;

  for (let i = 0; i < dd.length; i++) {
    if (dd[i] < 0 && !inDrawdown) {
      inDrawdown = true;
      currentStart = i;
    } else if (dd[i] >= 0 && inDrawdown) {
      inDrawdown = false;
      const dur = i - currentStart;
      if (dur > bestDuration) {
        bestDuration = dur;
        bestStart = currentStart;
        bestEnd = i;
      }
    }
  }
  // Still in drawdown at the end
  if (inDrawdown) {
    const dur = dd.length - 1 - currentStart;
    if (dur > bestDuration) {
      bestDuration = dur;
      bestStart = currentStart;
      bestEnd = dd.length - 1;
    }
  }
  return { start: bestStart, end: bestEnd, durationDays: bestDuration };
}

/** 23. Average drawdown (mean of all negative drawdown values) */
export function averageDrawdown(prices: number[]): number {
  const dd = drawdownSeries(prices).filter((v) => v < 0);
  if (dd.length === 0) return 0;
  return mean(dd);
}

/** 24. Recovery factor */
export function recoveryFactor(
  totalReturnVal: number,
  maxDrawdownVal: number
): number {
  if (maxDrawdownVal === 0) return 0;
  return totalReturnVal / Math.abs(maxDrawdownVal);
}

/** 25. Pain Index — mean of absolute drawdown depths */
export function painIndex(prices: number[]): number {
  const dd = drawdownSeries(prices);
  if (dd.length === 0) return 0;
  return mean(dd.map(Math.abs));
}

/** 26. Pain Ratio */
export function painRatio(cagrVal: number, painIdxVal: number): number {
  if (painIdxVal === 0) return 0;
  return cagrVal / painIdxVal;
}

// ============================================================
// E. VaR & CVaR
// ============================================================

/** 27. Historical VaR (positive number = potential loss) */
export function historicalVaR(returns: number[], confidence = 0.95): number {
  if (returns.length === 0) return 0;
  return -percentile(returns, (1 - confidence) * 100);
}

/** 28. Parametric (normal) VaR */
export function parametricVaR(
  meanReturn: number,
  stdDevReturn: number,
  confidence = 0.95
): number {
  // z-score: 1.645 for 95%, 2.326 for 99%
  const z = confidence >= 0.99 ? 2.326 : confidence >= 0.975 ? 1.96 : 1.645;
  return -(meanReturn - z * stdDevReturn);
}

/** 29. Conditional VaR (Expected Shortfall) */
export function cvar(returns: number[], confidence = 0.95): number {
  if (returns.length === 0) return 0;
  const threshold = -historicalVaR(returns, confidence);
  const tailReturns = returns.filter((r) => r <= threshold);
  if (tailReturns.length === 0) return 0;
  return -mean(tailReturns);
}

/** 30. Scale VaR from daily to multi-period using square-root-of-time rule */
export function scaleVaR(dailyVaR: number, periods = 10): number {
  return dailyVaR * Math.sqrt(periods);
}

// ============================================================
// F. FACTOR ANALYSIS
// ============================================================

/** 31. Beta — covariance(portfolio, market) / variance(market) */
export function betaCalc(
  portfolioReturns: number[],
  marketReturns: number[]
): number {
  const varMarket = covariance(marketReturns, marketReturns);
  if (varMarket === 0) return 0;
  return covariance(portfolioReturns, marketReturns) / varMarket;
}

/** 32. Jensen's Alpha */
export function jensensAlpha(
  portReturn: number,
  marketReturn: number,
  betaVal: number,
  riskFreeRate = 0
): number {
  return portReturn - (riskFreeRate + betaVal * (marketReturn - riskFreeRate));
}

/** 33. R-Squared (coefficient of determination) */
export function rSquared(
  portfolioReturns: number[],
  marketReturns: number[]
): number {
  const corr = pearsonCorrelation(portfolioReturns, marketReturns);
  return corr * corr;
}

/** 34. Tracking Error — std dev of active returns */
export function trackingError(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  const n = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (n < 2) return 0;
  const diffs = Array.from({ length: n }, (_, i) => portfolioReturns[i] - benchmarkReturns[i]);
  return stdDev(diffs);
}

/** 35. Rolling Beta over a sliding window */
export function rollingBeta(
  portfolioReturns: number[],
  marketReturns: number[],
  window = 12
): number[] {
  const n = Math.min(portfolioReturns.length, marketReturns.length);
  if (n < window) return [];
  const result: number[] = [];
  for (let i = 0; i <= n - window; i++) {
    const pSlice = portfolioReturns.slice(i, i + window);
    const mSlice = marketReturns.slice(i, i + window);
    result.push(betaCalc(pSlice, mSlice));
  }
  return result;
}

// ============================================================
// G. CORRELATION & COVARIANCE
// ============================================================

/** 36. Pearson correlation coefficient */
export function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const meanA = mean(a.slice(0, n));
  const meanB = mean(b.slice(0, n));
  let num = 0;
  let denomA = 0;
  let denomB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denomA += da * da;
    denomB += db * db;
  }
  const denom = Math.sqrt(denomA * denomB);
  if (denom === 0) return 0;
  return num / denom;
}

/** 37. Sample covariance */
export function covariance(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const meanA = mean(a.slice(0, n));
  const meanB = mean(b.slice(0, n));
  let sum = 0;
  for (let i = 0; i < n; i++) sum += (a[i] - meanA) * (b[i] - meanB);
  return sum / (n - 1);
}

/** 38. Correlation matrix for a list of return series */
export function correlationMatrix(returnsMatrix: number[][]): number[][] {
  const m = returnsMatrix.length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      pearsonCorrelation(returnsMatrix[i], returnsMatrix[j])
    )
  );
}

/** 39. Covariance matrix */
export function covarianceMatrix(returnsMatrix: number[][]): number[][] {
  const m = returnsMatrix.length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      covariance(returnsMatrix[i], returnsMatrix[j])
    )
  );
}

// ============================================================
// H. PORTFOLIO OPTIMIZATION
// ============================================================

/** 40. Expected portfolio return */
export function portfolioExpectedReturn(
  weights: number[],
  expectedReturns: number[]
): number {
  return weightedReturn(weights, expectedReturns);
}

/** 41. Portfolio variance: w^T * Σ * w */
export function portfolioVariance(
  weights: number[],
  covMatrix: number[][]
): number {
  const n = weights.length;
  let variance = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      variance += weights[i] * weights[j] * (covMatrix[i]?.[j] ?? 0);
    }
  }
  return Math.max(variance, 0);
}

/** 42. Portfolio volatility (std dev) */
export function portfolioVolatility(
  weights: number[],
  covMatrix: number[][]
): number {
  return Math.sqrt(portfolioVariance(weights, covMatrix));
}

/** 43. Minimum variance weights via gradient descent on the simplex */
export function minimumVarianceWeights(
  covMatrix: number[][],
  iterations = 500
): number[] {
  const n = covMatrix.length;
  if (n === 0) return [];
  let w = equalWeights(n);
  const lr = 0.01;

  for (let iter = 0; iter < iterations; iter++) {
    // gradient of w^T Σ w w.r.t. w = 2 Σ w
    const grad = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        grad[i] += 2 * (covMatrix[i]?.[j] ?? 0) * w[j];
      }
    }
    const updated = w.map((wi, i) => wi - lr * grad[i]);
    w = simplexProject(updated);
  }
  return w;
}

/** 44. Max Sharpe weights via gradient descent on the simplex */
export function maxSharpeWeights(
  expectedReturns: number[],
  covMatrix: number[][],
  riskFreeRate = 0
): number[] {
  const n = expectedReturns.length;
  if (n === 0) return [];
  let w = equalWeights(n);
  const lr = 0.01;

  for (let iter = 0; iter < 500; iter++) {
    const ret = portfolioExpectedReturn(w, expectedReturns);
    const vol = portfolioVolatility(w, covMatrix);
    if (vol === 0) break;
    const excess = ret - riskFreeRate;

    // Gradient of Sharpe w.r.t. w:
    // dS/dw = (dR/dw * vol - R * (dVol/dw)) / vol^2
    const dVol = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        dVol[i] += (covMatrix[i]?.[j] ?? 0) * w[j];
      }
      dVol[i] /= vol; // dVol/dw_i = (Σw)_i / vol
    }

    // Ascend Sharpe → negate gradient for descent in -Sharpe
    const grad = expectedReturns.map(
      (mu, i) => -((mu * vol - excess * dVol[i]) / (vol * vol))
    );

    const updated = w.map((wi, i) => wi - lr * grad[i]);
    w = simplexProject(updated);
  }
  return w;
}

/** 45. Risk parity weights (equal risk contribution) */
export function riskParityWeights(
  covMatrix: number[][],
  iterations = 500
): number[] {
  const n = covMatrix.length;
  if (n === 0) return [];
  let w = equalWeights(n);
  const lr = 0.01;

  for (let iter = 0; iter < iterations; iter++) {
    const vol = portfolioVolatility(w, covMatrix);
    if (vol === 0) break;

    // Marginal risk contribution for each asset
    const mrc = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        mrc[i] += (covMatrix[i]?.[j] ?? 0) * w[j];
      }
      mrc[i] /= vol; // ∂σ/∂w_i
    }

    // Risk contribution = w_i * MRC_i; target = vol / n
    const target = vol / n;
    const grad = mrc.map((m, i) => 2 * w[i] * m - target);
    const updated = w.map((wi, i) => wi - lr * grad[i]);
    w = simplexProject(updated);
  }
  return w;
}

/** 46. Equal weights */
export function equalWeights(nAssets: number): number[] {
  if (nAssets <= 0) return [];
  return Array(nAssets).fill(1 / nAssets);
}

/** 47. Efficient frontier — returns nPoints portfolios on the frontier */
export function efficientFrontier(
  expectedReturns: number[],
  covMatrix: number[][],
  nPoints = 100
): Array<{
  expectedReturn: number;
  volatility: number;
  sharpe: number;
  weights: number[];
}> {
  const n = expectedReturns.length;
  if (n === 0) return [];

  const minRet = Math.min(...expectedReturns);
  const maxRet = Math.max(...expectedReturns);
  const step = (maxRet - minRet) / Math.max(nPoints - 1, 1);

  const results: Array<{
    expectedReturn: number;
    volatility: number;
    sharpe: number;
    weights: number[];
  }> = [];

  for (let k = 0; k < nPoints; k++) {
    const targetRet = minRet + k * step;

    // Find min-variance portfolio with return >= targetRet via gradient descent
    let w = equalWeights(n);
    const lr = 0.01;
    const lambda = 10; // penalty for missing target return

    for (let iter = 0; iter < 500; iter++) {
      const ret = portfolioExpectedReturn(w, expectedReturns);
      const grad = Array(n).fill(0);

      // Variance gradient: 2 Σ w
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          grad[i] += 2 * (covMatrix[i]?.[j] ?? 0) * w[j];
        }
        // Penalty gradient: push return toward target
        grad[i] -= 2 * lambda * (ret - targetRet) * expectedReturns[i];
      }

      const updated = w.map((wi, i) => wi - lr * grad[i]);
      w = simplexProject(updated);
    }

    const vol = portfolioVolatility(w, covMatrix);
    const ret = portfolioExpectedReturn(w, expectedReturns);
    const sharpe = vol > 0 ? ret / vol : 0;
    results.push({ expectedReturn: ret, volatility: vol, sharpe, weights: w });
  }

  return results;
}

// ============================================================
// I. MONTE CARLO
// ============================================================

/** 48. Simulate one GBM price path */
export function simulatePath(
  initialValue: number,
  annReturn: number,
  annVol: number,
  years: number
): number[] {
  const steps = Math.round(years * 252);
  const dt = 1 / 252;
  const mu = annReturn;
  const sigma = annVol;
  const path: number[] = [initialValue];
  let S = initialValue;

  for (let i = 0; i < steps; i++) {
    // Box-Muller for standard normal
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
    S = S * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
    path.push(S);
  }
  return path;
}

/** 49. Monte Carlo projection with percentile bands */
export function monteCarloProjection(
  initialValue: number,
  cagrVal: number,
  vol: number,
  years: number,
  simulations = 1000
): { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] } {
  const steps = Math.round(years * 12); // monthly steps for performance
  const dt = 1 / 12;
  const mu = cagrVal;
  const sigma = vol;

  // Collect value at each month across all simulations
  const allPaths: number[][] = [];

  for (let sim = 0; sim < simulations; sim++) {
    const path: number[] = [initialValue];
    let S = initialValue;
    for (let i = 0; i < steps; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
      S = S * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
      path.push(S);
    }
    allPaths.push(path);
  }

  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];

  for (let t = 0; t <= steps; t++) {
    const cross = allPaths.map((p) => p[t]);
    p10.push(percentile(cross, 10));
    p25.push(percentile(cross, 25));
    p50.push(percentile(cross, 50));
    p75.push(percentile(cross, 75));
    p90.push(percentile(cross, 90));
  }

  return { p10, p25, p50, p75, p90 };
}

/** 50. Probability that simulated final values exceed initial value */
export function probabilityOfGain(
  simulatedFinalValues: number[],
  initialValue: number
): number {
  if (simulatedFinalValues.length === 0) return 0;
  const gains = simulatedFinalValues.filter((v) => v > initialValue).length;
  return gains / simulatedFinalValues.length;
}

// ============================================================
// J. REBALANCING
// ============================================================

/** 51. Drift from target weights */
export function allocationDrift(
  currentWeights: number[],
  targetWeights: number[]
): number[] {
  const n = Math.min(currentWeights.length, targetWeights.length);
  return Array.from({ length: n }, (_, i) => currentWeights[i] - targetWeights[i]);
}

/** 52. Decides if rebalancing is needed (any drift exceeds threshold) */
export function needsRebalancing(
  currentWeights: number[],
  targetWeights: number[],
  threshold = 0.05
): boolean {
  return allocationDrift(currentWeights, targetWeights).some(
    (d) => Math.abs(d) > threshold
  );
}

/** 53. Backtest a portfolio with periodic rebalancing */
export function backtestPortfolio(
  weights: number[],
  returnsMatrix: number[][], // [assetIndex][periodIndex]
  dates: string[],
  rebalance: "none" | "monthly" | "quarterly" | "annual"
): {
  portfolioValues: number[];
  dates: string[];
  annualReturns: Record<string, number>;
} {
  const nPeriods = dates.length;
  const nAssets = weights.length;
  if (nPeriods === 0 || nAssets === 0) {
    return { portfolioValues: [1], dates, annualReturns: {} };
  }

  let currentWeights = [...weights];
  const portfolioValues: number[] = [1];
  const annualReturns: Record<string, number> = {};

  let prevYearValue = 1;
  let prevYear = dates[0]?.slice(0, 4) ?? "0000";

  for (let t = 0; t < nPeriods; t++) {
    // Compute portfolio return for this period
    let periodReturn = 0;
    for (let a = 0; a < nAssets; a++) {
      periodReturn += currentWeights[a] * (returnsMatrix[a]?.[t] ?? 0);
    }

    const newValue = portfolioValues[portfolioValues.length - 1] * (1 + periodReturn);
    portfolioValues.push(newValue);

    // Update float weights after return
    const assetValues = currentWeights.map(
      (w, a) => w * (1 + (returnsMatrix[a]?.[t] ?? 0))
    );
    const totalValue = assetValues.reduce((s, v) => s + v, 0);
    currentWeights = totalValue > 0 ? assetValues.map((v) => v / totalValue) : [...weights];

    // Check rebalancing
    const currentDate = dates[t] ?? "";
    const month = parseInt(currentDate.slice(5, 7), 10);
    const doRebalance =
      rebalance === "monthly" ||
      (rebalance === "quarterly" && month % 3 === 1) ||
      (rebalance === "annual" && month === 1);

    if (doRebalance && (rebalance as string) !== "none") {
      currentWeights = [...weights];
    }

    // Accumulate annual returns
    const currentYear = currentDate.slice(0, 4);
    if (currentYear !== prevYear) {
      const startVal = prevYearValue;
      const endVal = portfolioValues[portfolioValues.length - 1];
      annualReturns[prevYear] = startVal > 0 ? (endVal - startVal) / startVal : 0;
      prevYear = currentYear;
      prevYearValue = endVal;
    }
  }

  // Final year
  const lastVal = portfolioValues[portfolioValues.length - 1];
  annualReturns[prevYear] = prevYearValue > 0 ? (lastVal - prevYearValue) / prevYearValue : 0;

  return { portfolioValues, dates, annualReturns };
}

// ============================================================
// K. ADDITIONAL STATISTICS
// ============================================================

/** 54. Best single-period return */
export function bestPeriod(returns: number[]): number {
  if (returns.length === 0) return 0;
  return Math.max(...returns);
}

/** 55. Worst single-period return */
export function worstPeriod(returns: number[]): number {
  if (returns.length === 0) return 0;
  return Math.min(...returns);
}

/** 56. Win rate — fraction of periods with positive return */
export function winRate(returns: number[]): number {
  if (returns.length === 0) return 0;
  return returns.filter((r) => r > 0).length / returns.length;
}

/** 57. Gain/loss ratio — average gain / |average loss| */
export function gainLossRatio(returns: number[]): number {
  const gains = returns.filter((r) => r > 0);
  const losses = returns.filter((r) => r < 0);
  const avgG = gains.length > 0 ? mean(gains) : 0;
  const avgL = losses.length > 0 ? Math.abs(mean(losses)) : 0;
  if (avgL === 0) return avgG === 0 ? 1 : Infinity;
  return avgG / avgL;
}

/** 58. Average gain */
export function avgGain(returns: number[]): number {
  const gains = returns.filter((r) => r > 0);
  return gains.length > 0 ? mean(gains) : 0;
}

/** 59. Average loss (returned as positive magnitude) */
export function avgLoss(returns: number[]): number {
  const losses = returns.filter((r) => r < 0);
  return losses.length > 0 ? Math.abs(mean(losses)) : 0;
}

/** 60. Profit factor — sum of gains / sum of |losses| */
export function profitFactor(returns: number[]): number {
  const totalGain = returns.filter((r) => r > 0).reduce((s, v) => s + v, 0);
  const totalLoss = Math.abs(returns.filter((r) => r < 0).reduce((s, v) => s + v, 0));
  if (totalLoss === 0) return totalGain === 0 ? 1 : Infinity;
  return totalGain / totalLoss;
}

/** 61. Tail ratio — 95th percentile gain / |5th percentile loss| */
export function tailRatio(returns: number[]): number {
  if (returns.length === 0) return 0;
  const right = percentile(returns, 95);
  const left = Math.abs(percentile(returns, 5));
  if (left === 0) return right === 0 ? 1 : Infinity;
  return right / left;
}

/** 62. Skewness (third standardized moment) */
export function skewness(returns: number[]): number {
  const n = returns.length;
  if (n < 3) return 0;
  const m = mean(returns);
  const s = stdDev(returns);
  if (s === 0) return 0;
  const sum = returns.reduce((acc, r) => acc + Math.pow((r - m) / s, 3), 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

/** 63. Excess kurtosis (fourth standardized moment minus 3) */
export function kurtosis(returns: number[]): number {
  const n = returns.length;
  if (n < 4) return 0;
  const m = mean(returns);
  const s = stdDev(returns);
  if (s === 0) return 0;
  const sum = returns.reduce((acc, r) => acc + Math.pow((r - m) / s, 4), 0);
  const kurt =
    ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum -
    (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  return kurt;
}

/** 64. Active return vs benchmark */
export function activeReturn(
  portfolioReturn: number,
  benchmarkReturn: number
): number {
  return portfolioReturn - benchmarkReturn;
}

/** 65. Batting average — fraction of periods portfolio beats benchmark */
export function battingAverage(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  const n = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (n === 0) return 0;
  let beats = 0;
  for (let i = 0; i < n; i++) {
    if (portfolioReturns[i] > benchmarkReturns[i]) beats++;
  }
  return beats / n;
}
