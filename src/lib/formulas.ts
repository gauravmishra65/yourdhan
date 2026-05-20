// ============================================================
// YourDhan – Formula Registry
// Human-readable metadata for all 63+ financial metrics
// ============================================================

export interface FormulaInfo {
  /** Display name */
  name: string;
  /** LaTeX-style formula string */
  formula: string;
  /** One-sentence description of what the metric measures */
  description: string;
  /** How to interpret good vs bad values */
  interpretation: string;
  /** Unit of the output */
  unit: string;
}

export const FORMULAS: Record<string, FormulaInfo> = {
  // ----------------------------------------------------------
  // A. RETURNS
  // ----------------------------------------------------------
  simpleReturn: {
    name: "Simple Return",
    formula: "(P_end - P_start) / P_start",
    description: "Point-to-point price change expressed as a fraction of the starting price.",
    interpretation: "Higher is better. Compare against benchmark or inflation.",
    unit: "percent",
  },
  totalReturn: {
    name: "Total Return",
    formula: "(P_end + Dividends - P_start) / P_start",
    description: "Total investor gain including capital appreciation and income distributions.",
    interpretation: "Higher is better. Always prefer this over price-only return.",
    unit: "percent",
  },
  cagr: {
    name: "CAGR",
    formula: "(P_end / P_start)^(1/N) - 1",
    description: "Compound Annual Growth Rate — the smoothed annual return over N years.",
    interpretation: "> 15% exceptional · 10-15% excellent · 8-10% good · < 8% modest",
    unit: "percent",
  },
  logReturn: {
    name: "Log Return",
    formula: "ln(P_curr / P_prev)",
    description: "Continuously compounded return; additive over time.",
    interpretation: "Used in statistical analysis. Approximately equals simple return for small values.",
    unit: "dimensionless",
  },
  weightedReturn: {
    name: "Weighted Return",
    formula: "Σ w_i × r_i",
    description: "Portfolio-level return as the weighted sum of individual asset returns.",
    interpretation: "Higher is better. Reflects the blended performance across all holdings.",
    unit: "percent",
  },
  annualizeMonthly: {
    name: "Annualized Monthly Return",
    formula: "(Π (1 + r_i))^(12/N) - 1",
    description: "Converts N monthly returns to an equivalent annualized figure.",
    interpretation: "> 10% good on an annual basis.",
    unit: "percent",
  },
  rollingReturn: {
    name: "Rolling Return",
    formula: "Π(1 + r_t...t+w) - 1  over window w",
    description: "Sliding-window compounded return series to visualize consistency over time.",
    interpretation: "Positive rolling returns across all windows indicate robustness.",
    unit: "percent",
  },

  // ----------------------------------------------------------
  // B. RISK
  // ----------------------------------------------------------
  annualizedStdDev: {
    name: "Annualized Volatility",
    formula: "σ_period × √f  (f = 252 daily, 12 monthly)",
    description: "Annualized standard deviation of returns; the most common risk measure.",
    interpretation: "< 10% low · 10-20% moderate · > 20% high. Lower is better for risk-averse investors.",
    unit: "percent",
  },
  downsideDeviation: {
    name: "Downside Deviation",
    formula: "√( mean( min(r - T, 0)² ) )",
    description: "Like std dev but penalizes only returns below a target T (default 0).",
    interpretation: "Lower is better. Used in Sortino ratio denominator.",
    unit: "percent",
  },
  ulcerIndex: {
    name: "Ulcer Index",
    formula: "√( mean( D_i² ) )  where D_i = (P_i - PeakP) / PeakP × 100",
    description: "Measures the depth and duration of portfolio drawdowns; captures investor stress.",
    interpretation: "< 5 low stress · 5-15 moderate · > 15 high. Lower is better.",
    unit: "percent",
  },
  semiVariance: {
    name: "Semi-Variance",
    formula: "mean( min(r - μ, 0)² )",
    description: "Variance of returns that fall below the mean; captures downside risk.",
    interpretation: "Lower is better. Used when return distributions are asymmetric.",
    unit: "percent²",
  },

  // ----------------------------------------------------------
  // C. RISK-ADJUSTED RATIOS
  // ----------------------------------------------------------
  sharpeRatio: {
    name: "Sharpe Ratio",
    formula: "(R_p - R_f) / σ_p",
    description: "Excess return per unit of total volatility.",
    interpretation: "> 2 excellent · 1-2 good · 0.5-1 acceptable · < 0.5 poor",
    unit: "ratio",
  },
  sortinoRatio: {
    name: "Sortino Ratio",
    formula: "(R_p - R_f) / σ_downside",
    description: "Excess return per unit of downside risk; ignores upside volatility.",
    interpretation: "> 2 excellent · 1-2 good · < 1 poor",
    unit: "ratio",
  },
  treynorRatio: {
    name: "Treynor Ratio",
    formula: "(R_p - R_f) / β",
    description: "Excess return per unit of systematic (market) risk.",
    interpretation: "Higher is better. Compare across diversified portfolios.",
    unit: "ratio",
  },
  calmarRatio: {
    name: "Calmar Ratio",
    formula: "CAGR / |MaxDrawdown|",
    description: "Annualized return per unit of maximum drawdown.",
    interpretation: "> 3 exceptional · 1-3 good · < 1 poor",
    unit: "ratio",
  },
  omegaRatio: {
    name: "Omega Ratio",
    formula: "Σ max(r - T, 0) / Σ max(T - r, 0)",
    description: "Probability-weighted ratio of gains to losses above and below a threshold T.",
    interpretation: "> 1.5 good · 1 break-even · < 1 poor",
    unit: "ratio",
  },
  martinRatio: {
    name: "Martin Ratio (UPI)",
    formula: "(R_p - R_f) / UlcerIndex",
    description: "Ulcer Performance Index — reward per unit of drawdown stress.",
    interpretation: "Higher is better. Complementary to Sharpe for drawdown-conscious investors.",
    unit: "ratio",
  },
  informationRatio: {
    name: "Information Ratio",
    formula: "mean(r_p - r_b) / σ(r_p - r_b)",
    description: "Active return per unit of tracking error; measures manager skill.",
    interpretation: "> 0.5 good · > 1 exceptional · < 0 underperforming",
    unit: "ratio",
  },
  modigliani: {
    name: "Modigliani M²",
    formula: "Sharpe × σ_market + R_f",
    description: "Scales portfolio performance to market volatility; directly comparable.",
    interpretation: "Higher than market return indicates outperformance on risk-adjusted basis.",
    unit: "percent",
  },

  // ----------------------------------------------------------
  // D. DRAWDOWN
  // ----------------------------------------------------------
  maxDrawdown: {
    name: "Maximum Drawdown",
    formula: "min_t( (P_t - max_{s≤t} P_s) / max_{s≤t} P_s )",
    description: "Largest peak-to-trough decline in portfolio value.",
    interpretation: "> -10% mild · -10% to -20% moderate · < -30% severe",
    unit: "percent",
  },
  averageDrawdown: {
    name: "Average Drawdown",
    formula: "mean of all negative drawdown values",
    description: "Average depth of drawdowns; smoother measure than max drawdown.",
    interpretation: "Lower absolute value is better.",
    unit: "percent",
  },
  recoveryFactor: {
    name: "Recovery Factor",
    formula: "Total Return / |MaxDrawdown|",
    description: "Total profit relative to the worst loss experienced.",
    interpretation: "> 5 excellent · 2-5 good · < 1 poor",
    unit: "ratio",
  },
  painIndex: {
    name: "Pain Index",
    formula: "mean( |DD_i| )",
    description: "Average absolute drawdown across all periods; quantifies overall pain.",
    interpretation: "Lower is better. Complement to Ulcer Index.",
    unit: "percent",
  },
  painRatio: {
    name: "Pain Ratio",
    formula: "CAGR / PainIndex",
    description: "Return earned per unit of average drawdown experienced.",
    interpretation: "Higher is better.",
    unit: "ratio",
  },

  // ----------------------------------------------------------
  // E. VaR & CVaR
  // ----------------------------------------------------------
  historicalVaR: {
    name: "Historical VaR",
    formula: "–percentile(returns, 1 – confidence)",
    description: "Maximum expected loss at a given confidence level using historical data.",
    interpretation: "e.g. 95% daily VaR of 2% means 5% chance of losing > 2% in a day.",
    unit: "percent",
  },
  parametricVaR: {
    name: "Parametric VaR",
    formula: "–( μ – z × σ )  where z ≈ 1.645 (95%)",
    description: "VaR assuming normally distributed returns.",
    interpretation: "Useful for quick estimates; understates risk in fat-tailed distributions.",
    unit: "percent",
  },
  cvar: {
    name: "CVaR (Expected Shortfall)",
    formula: "–mean( r | r ≤ VaR_threshold )",
    description: "Average loss in the worst (1-confidence) % of scenarios; beyond-VaR risk.",
    interpretation: "Always ≥ VaR. Lower is better. Preferred by regulators.",
    unit: "percent",
  },

  // ----------------------------------------------------------
  // F. FACTOR ANALYSIS
  // ----------------------------------------------------------
  beta: {
    name: "Beta",
    formula: "Cov(r_p, r_m) / Var(r_m)",
    description: "Sensitivity of portfolio returns to market (systematic) movements.",
    interpretation: "β=1 moves with market · β>1 amplifies · β<1 dampens · β<0 inverse",
    unit: "ratio",
  },
  jensensAlpha: {
    name: "Jensen's Alpha",
    formula: "R_p – [ R_f + β × (R_m – R_f) ]",
    description: "Return in excess of what CAPM predicts given the portfolio's beta.",
    interpretation: "> 0 outperforms CAPM expectation · < 0 underperforms",
    unit: "percent",
  },
  rSquared: {
    name: "R-Squared",
    formula: "Corr(r_p, r_m)²",
    description: "Fraction of portfolio variance explained by market movements.",
    interpretation: "0.85-1.00 highly correlated · 0.50-0.85 moderate · < 0.50 low",
    unit: "ratio (0–1)",
  },
  trackingError: {
    name: "Tracking Error",
    formula: "σ(r_p – r_b)",
    description: "Standard deviation of the active return relative to a benchmark.",
    interpretation: "< 2% tight index tracker · 2-8% active · > 8% high active risk",
    unit: "percent",
  },

  // ----------------------------------------------------------
  // G. PORTFOLIO CONSTRUCTION
  // ----------------------------------------------------------
  portfolioExpectedReturn: {
    name: "Portfolio Expected Return",
    formula: "Σ w_i × μ_i",
    description: "Weighted average of individual asset expected returns.",
    interpretation: "Higher is better, subject to acceptable risk.",
    unit: "percent",
  },
  portfolioVariance: {
    name: "Portfolio Variance",
    formula: "wᵀ Σ w",
    description: "Portfolio risk in variance terms; accounts for asset correlations.",
    interpretation: "Lower is better for a given return level.",
    unit: "percent²",
  },
  portfolioVolatility: {
    name: "Portfolio Volatility",
    formula: "√(wᵀ Σ w)",
    description: "Portfolio standard deviation — the square root of portfolio variance.",
    interpretation: "< 10% conservative · 10-20% moderate · > 20% aggressive",
    unit: "percent",
  },

  // ----------------------------------------------------------
  // K. ADDITIONAL STATISTICS
  // ----------------------------------------------------------
  winRate: {
    name: "Win Rate",
    formula: "count(r > 0) / N",
    description: "Fraction of periods with a positive return.",
    interpretation: "> 60% strong · 50-60% moderate · < 50% poor",
    unit: "percent",
  },
  gainLossRatio: {
    name: "Gain/Loss Ratio",
    formula: "mean(gains) / |mean(losses)|",
    description: "How much the average winning period earns vs the average losing period loses.",
    interpretation: "> 1.5 good · > 2.0 excellent · < 1 poor",
    unit: "ratio",
  },
  profitFactor: {
    name: "Profit Factor",
    formula: "Σ gains / |Σ losses|",
    description: "Total profits divided by total losses; overall edge of the strategy.",
    interpretation: "> 1.5 good · > 2 excellent · < 1 unprofitable",
    unit: "ratio",
  },
  tailRatio: {
    name: "Tail Ratio",
    formula: "P95(returns) / |P5(returns)|",
    description: "Ratio of the right tail to the left tail; measures return asymmetry.",
    interpretation: "> 1 right-skewed (favorable) · < 1 left-skewed (unfavorable)",
    unit: "ratio",
  },
  skewness: {
    name: "Skewness",
    formula: "(N / ((N-1)(N-2))) × Σ((r - μ) / σ)³",
    description: "Asymmetry of the return distribution around the mean.",
    interpretation: "> 0 positive skew (rare big gains) · < 0 negative skew (rare big losses)",
    unit: "dimensionless",
  },
  kurtosis: {
    name: "Excess Kurtosis",
    formula: "Fisher kurtosis − 3",
    description: "Heaviness of distribution tails relative to a normal distribution.",
    interpretation: "> 0 fat tails (higher crash risk) · < 0 thin tails",
    unit: "dimensionless",
  },
  battingAverage: {
    name: "Batting Average",
    formula: "count(r_p > r_b) / N",
    description: "Fraction of periods the portfolio outperforms the benchmark.",
    interpretation: "> 50% consistent outperformer · < 50% consistent underperformer",
    unit: "percent",
  },
  activeReturn: {
    name: "Active Return",
    formula: "R_portfolio − R_benchmark",
    description: "Excess return earned above or below the benchmark in a given period.",
    interpretation: "> 0 outperforming · < 0 underperforming",
    unit: "percent",
  },
};
