// ============================================================
// YourDhan – Portfolio Performance Backtester
// ============================================================
import { useState, useCallback } from 'react';
import {
  AreaChart, Area, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Info, Plus, X, TrendingUp, AlertTriangle } from 'lucide-react';

import { ANNUAL_RETURNS } from '../../data/mockData';
import {
  weightedReturn,
  backtestPortfolio,
  cagr,
  maxDrawdown,
  drawdownSeries,
  sharpeRatio,
  sortinoRatio,
  annualizedStdDev,
  downsideDeviation,
  ulcerIndex,
  calmarRatio,
  treynorRatio,
  omegaRatio,
  martinRatio,
  informationRatio,
  historicalVaR,
  cvar,
  skewness,
  kurtosis,
  tailRatio,
  gainLossRatio,
  winRate,
  bestPeriod,
  worstPeriod,
  betaCalc,
  jensensAlpha,
  rSquared,
  trackingError,
  battingAverage,
  activeReturn,
  averageDrawdown,
  maxDrawdownDuration,
} from '../../lib/finance';
import { usePortfolioStore } from '../../store';
import { formatIndianNumber } from '../../lib/utils';
import type { Asset, PortfolioSettings, BacktestResults } from '../../types';

// ---------------------
// Constants
// ---------------------
const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#f43f5e'];
const BENCHMARK_COLOR = '#f59e0b';
const PORTFOLIO_COLOR = '#3b82f6';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------
// Helpers
// ---------------------
function fmtPct(v: number, sign = true): string {
  const abs = Math.abs(v) * 100;
  const s = abs.toFixed(2) + '%';
  if (!sign) return s;
  return v >= 0 ? '+' + s : '-' + s;
}
function fmtPct1(v: number): string {
  const s = (Math.abs(v) * 100).toFixed(1) + '%';
  return v >= 0 ? '+' + s : '-' + s;
}
function fmtNum(v: number, d = 2): string {
  return isFinite(v) ? v.toFixed(d) : '—';
}
function formatYAxis(v: number): string {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

// Generate deterministic monthly returns from annual data
function buildMonthlyReturnsForAsset(symbol: string, years: number[]): number[] {
  const annData = ANNUAL_RETURNS[symbol];
  if (!annData) return years.flatMap(() => Array(12).fill(0));
  const monthly: number[] = [];
  years.forEach((y) => {
    const ann = annData[y] ?? 0;
    const base = ann / 12;
    const noise = ann * 0.04;
    const bias = [-0.8, -0.2, 0.5, 0.3, -0.1, 0.1, 0.2, 0.0, -0.3, 0.4, 0.5, 0.5];
    let seed = y * 7 + 13;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
      return (seed / 0x7fffffff) * 2 - 1;
    };
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const v = parseFloat((base + bias[i] * noise + rng() * noise * 0.5).toFixed(4));
      monthly.push(v);
      sum += v;
    }
    monthly.push(parseFloat((ann - sum).toFixed(4)));
  });
  return monthly;
}

function heatmapColor(v: number): string {
  if (v > 0.05) return '#14532d';
  if (v > 0.03) return '#166534';
  if (v > 0.01) return '#15803d';
  if (v > 0)    return 'rgba(134,239,172,0.25)';
  if (v === 0)  return 'transparent';
  if (v > -0.01) return 'rgba(252,165,165,0.25)';
  if (v > -0.03) return '#dc2626';
  if (v > -0.05) return '#991b1b';
  return '#7f1d1d';
}

// Metric tooltip copy
const METRIC_TIPS: Record<string, string> = {
  'Total Return': 'Cumulative growth of initial investment over the full period.',
  'CAGR': 'Compound Annual Growth Rate — the steady annual return that would produce the same final value.',
  'Max Drawdown': 'The largest peak-to-trough decline in portfolio value.',
  'Sharpe Ratio': '(CAGR − Risk-Free Rate) / Volatility. Values >1 are considered good.',
  'Sortino Ratio': 'Like Sharpe but only penalises downside (negative) volatility.',
  'Ann. Volatility': 'Annualised standard deviation of monthly returns. Measures total risk.',
};

// ---- Sub-components ----

function SkeletonCard() {
  return (
    <div className="bg-[#131929] rounded-xl p-4 animate-pulse">
      <div className="h-3 w-24 bg-[#1a2235] rounded mb-2" />
      <div className="h-6 w-32 bg-[#1a2235] rounded" />
    </div>
  );
}

function MetricCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color: string;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div className="bg-[#131929] rounded-xl p-4 border border-[#1e2d45] relative">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <button
          onClick={() => setTip(!tip)}
          className="text-slate-600 hover:text-slate-400 transition-colors"
          aria-label="Formula info"
        >
          <Info size={12} />
        </button>
      </div>
      {tip && (
        <div className="absolute z-20 top-8 left-0 bg-[#1a2235] border border-[#1e2d45] rounded-lg p-2 text-xs text-slate-300 w-52 shadow-xl">
          {METRIC_TIPS[label] ?? label}
        </div>
      )}
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function StatRow({ label, port, bench, hasBench }: {
  label: string; port: string; bench: string | null; hasBench: boolean;
}) {
  return (
    <tr className="hover:bg-[#1a2235] transition-colors">
      <td className="py-1.5 text-slate-400">{label}</td>
      <td className="py-1.5 text-right font-mono text-slate-200">{port}</td>
      {hasBench && <td className="py-1.5 text-right font-mono text-slate-400">{bench ?? '—'}</td>}
    </tr>
  );
}

// Extended results type for internal use
interface ExtendedResults extends BacktestResults {
  bmMetrics: Record<string, number>;
  years: number[];
  portMonthly: number[];
  bmMonthly: number[];
}

// ---------------------
// Main Component
// ---------------------
export default function PortfolioPerformancePage() {
  const store = usePortfolioStore();

  const [assets, setAssets] = useState<Asset[]>(
    store.assets.length ? store.assets : [{ symbol: 'SPY', weight: 60 }, { symbol: 'BND', weight: 40 }]
  );
  const [settings, setSettings] = useState<PortfolioSettings>(store.settings);
  const [autoNorm, setAutoNorm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ExtendedResults | null>(null);
  const [logScale, setLogScale] = useState(false);
  const [timeRange, setTimeRange] = useState<'5Y' | '10Y' | '15Y' | '20Y' | 'Max'>('Max');
  const [expandedStats, setExpandedStats] = useState(false);

  const totalWeight = assets.reduce((s, a) => s + (a.weight || 0), 0);

  const updateSymbol = (idx: number, sym: string) =>
    setAssets(assets.map((a, i) => i === idx ? { ...a, symbol: sym.toUpperCase() } : a));

  const updateWeight = (idx: number, w: number) =>
    setAssets(assets.map((a, i) => i === idx ? { ...a, weight: w } : a));

  const addAsset = () => setAssets([...assets, { symbol: '', weight: 0 }]);
  const removeAsset = (idx: number) => setAssets(assets.filter((_, i) => i !== idx));

  const normalizeWeights = useCallback(() => {
    const total = assets.reduce((s, a) => s + (a.weight || 0), 0);
    if (total === 0) return;
    setAssets(assets.map((a) => ({ ...a, weight: parseFloat(((a.weight / total) * 100).toFixed(2)) })));
  }, [assets]);

  // ---- Run Analysis ----
  const runAnalysis = useCallback(async () => {
    const validAssets = assets.filter((a) => a.symbol && ANNUAL_RETURNS[a.symbol]);
    if (validAssets.length === 0) return;

    setIsLoading(true);
    store.setAssets(assets);
    store.setSettings(settings);

    await new Promise((r) => setTimeout(r, 800));

    // Year / date range
    const years: number[] = [];
    for (let y = settings.startYear; y <= settings.endYear; y++) years.push(y);

    const dates: string[] = [];
    years.forEach((y) => {
      for (let m = 1; m <= 12; m++) dates.push(`${y}-${String(m).padStart(2, '0')}`);
    });

    // Normalise weights
    const rawWeights = validAssets.map((a) => a.weight / 100);
    const wSum = rawWeights.reduce((s, w) => s + w, 0);
    const normWeights = wSum > 0 ? rawWeights.map((w) => w / wSum) : rawWeights;

    // Monthly returns matrices
    const returnsMatrix = validAssets.map((a) => buildMonthlyReturnsForAsset(a.symbol, years));
    const bmSymbol = settings.benchmark !== 'none' ? settings.benchmark : null;
    const bmMonthly = bmSymbol ? buildMonthlyReturnsForAsset(bmSymbol, years) : dates.map(() => 0);

    // Backtest
    const portResult = backtestPortfolio(normWeights, returnsMatrix, dates, settings.rebalance);
    const bmResult = backtestPortfolio([1], [bmMonthly], dates, 'none');

    const portValues = portResult.portfolioValues.map((v) => v * settings.initialAmount);
    const bmValues = bmResult.portfolioValues.map((v) => v * settings.initialAmount);

    // Annual returns arrays
    const portAnnReturns = years.map((y) => {
      const perAsset = validAssets.map((a) => ANNUAL_RETURNS[a.symbol]?.[y] ?? 0);
      return weightedReturn(normWeights, perAsset);
    });
    const bmAnnReturns = bmSymbol ? years.map((y) => ANNUAL_RETURNS[bmSymbol]?.[y] ?? 0) : years.map(() => 0);

    // Monthly portfolio return array (for stats)
    const portMonthlyArr: number[] = [];
    for (let t = 0; t < dates.length; t++) {
      let r = 0;
      normWeights.forEach((w, ai) => { r += w * (returnsMatrix[ai][t] ?? 0); });
      portMonthlyArr.push(r);
    }

    // Compute metrics
    const annVol = annualizedStdDev(portMonthlyArr, 'monthly');
    const bmVol = annualizedStdDev(bmMonthly, 'monthly');
    const startVal = portValues[0];
    const endVal = portValues[portValues.length - 1];
    const totalRet = (endVal - startVal) / startVal;
    const cagrVal = cagr(startVal, endVal, years.length);
    const mdd = maxDrawdown(portValues);
    const ddDur = maxDrawdownDuration(portValues).durationDays;
    const uIdx = ulcerIndex(portValues);
    const avgDD = averageDrawdown(portValues);
    const sharpe = sharpeRatio(cagrVal, annVol, settings.riskFreeRate);
    const ddDev = downsideDeviation(portMonthlyArr);
    const sortino = sortinoRatio(cagrVal, ddDev * Math.sqrt(12), settings.riskFreeRate);
    const bmCagr = cagr(bmValues[0], bmValues[bmValues.length - 1], years.length);
    const betaV = betaCalc(portMonthlyArr, bmMonthly);
    const alphaV = jensensAlpha(cagrVal, bmCagr, betaV, settings.riskFreeRate);
    const r2 = rSquared(portMonthlyArr, bmMonthly);
    const te = trackingError(portMonthlyArr, bmMonthly);
    const ir = informationRatio(portMonthlyArr, bmMonthly);
    const ba = battingAverage(portMonthlyArr, bmMonthly);
    const ar = activeReturn(cagrVal, bmCagr);

    const metrics = {
      totalReturn: totalRet,
      cagr: cagrVal,
      maxDrawdown: mdd,
      sharpe,
      sortino,
      annualizedVolatility: annVol,
      calmar: calmarRatio(cagrVal, mdd),
      treynor: treynorRatio(cagrVal, betaV, settings.riskFreeRate),
      omega: omegaRatio(portMonthlyArr, settings.riskFreeRate / 12),
      martin: martinRatio(cagrVal, uIdx, settings.riskFreeRate),
      informationRatio: ir,
      beta: betaV,
      alpha: alphaV,
      rSquared: r2,
      trackingError: te,
      var95: historicalVaR(portMonthlyArr, 0.95),
      cvar95: cvar(portMonthlyArr, 0.95),
      ulcerIndex: uIdx,
      painIndex: avgDD,
      skewness: skewness(portMonthlyArr),
      kurtosis: kurtosis(portMonthlyArr),
      tailRatio: tailRatio(portMonthlyArr),
      gainLossRatio: gainLossRatio(portMonthlyArr),
      winRate: winRate(portAnnReturns),
      bestYear: bestPeriod(portAnnReturns),
      worstYear: worstPeriod(portAnnReturns),
      bestMonth: bestPeriod(portMonthlyArr),
      worstMonth: worstPeriod(portMonthlyArr),
      avgDrawdown: avgDD,
      maxDrawdownDuration: ddDur,
      battingAverage: ba,
      activeReturn: ar,
      modigliani: 0,
      recoveryFactor: 0,
    };

    const bmMdd = maxDrawdown(bmValues);
    const bmMetrics = {
      totalReturn: (bmValues[bmValues.length - 1] - bmValues[0]) / bmValues[0],
      cagr: bmCagr,
      maxDrawdown: bmMdd,
      sharpe: sharpeRatio(bmCagr, bmVol, settings.riskFreeRate),
      sortino: sortinoRatio(bmCagr, downsideDeviation(bmMonthly) * Math.sqrt(12), settings.riskFreeRate),
      annualizedVolatility: bmVol,
      calmar: calmarRatio(bmCagr, bmMdd),
      bestYear: bestPeriod(bmAnnReturns),
      worstYear: worstPeriod(bmAnnReturns),
      bestMonth: bestPeriod(bmMonthly),
      worstMonth: worstPeriod(bmMonthly),
      winRate: winRate(bmAnnReturns),
      ulcerIndex: ulcerIndex(bmValues),
      avgDrawdown: averageDrawdown(bmValues),
      maxDrawdownDuration: maxDrawdownDuration(bmValues).durationDays,
      skewness: skewness(bmMonthly),
      kurtosis: kurtosis(bmMonthly),
      var95: historicalVaR(bmMonthly, 0.95),
      cvar95: cvar(bmMonthly, 0.95),
      tailRatio: tailRatio(bmMonthly),
      gainLossRatio: gainLossRatio(bmMonthly),
      beta: 1,
      alpha: 0,
      rSquared: 1,
      trackingError: 0,
      battingAverage: 0.5,
      activeReturn: 0,
    };

    setResults({
      portfolioValues: portValues,
      benchmarkValues: bmValues,
      dates,
      annualReturns: portAnnReturns.reduce((acc, v, i) => ({ ...acc, [years[i]]: v }), {}),
      benchmarkAnnualReturns: bmAnnReturns.reduce((acc, v, i) => ({ ...acc, [years[i]]: v }), {}),
      metrics,
      bmMetrics,
      years,
      portMonthly: portMonthlyArr,
      bmMonthly,
    });

    setIsLoading(false);
  }, [assets, settings, store]);

  // ---- Derived chart data ----
  const getGrowthChartData = () => {
    if (!results) return [];
    const totalMonths = results.dates.length;
    let startMonthIdx = 0;
    if (timeRange !== 'Max') {
      const yrs = parseInt(timeRange);
      startMonthIdx = Math.max(0, totalMonths - yrs * 12);
    }
    const startYearIdx = Math.floor(startMonthIdx / 12);
    return results.years
      .slice(startYearIdx)
      .map((y, i) => {
        const idx = Math.min((startYearIdx + i + 1) * 12, results.portfolioValues.length - 1);
        return {
          year: String(y),
          portfolio: Math.round(results.portfolioValues[idx]),
          benchmark: Math.round(results.benchmarkValues[idx]),
        };
      });
  };

  const getAnnualReturnsData = () => {
    if (!results) return [];
    return results.years.map((y) => ({
      year: String(y),
      portfolio: parseFloat(((results.annualReturns[y] ?? 0) * 100).toFixed(2)),
      benchmark: parseFloat(((results.benchmarkAnnualReturns[y] ?? 0) * 100).toFixed(2)),
    }));
  };

  const getDrawdownData = () => {
    if (!results) return [];
    const dd = drawdownSeries(results.portfolioValues);
    return results.years.map((y, i) => ({
      year: String(y),
      drawdown: parseFloat((dd[Math.min((i + 1) * 12, dd.length - 1)] * 100).toFixed(2)),
    }));
  };

  const getMonthlyHeatmapData = (): { years: number[]; data: Record<number, Record<number, number>> } => {
    if (!results) return { years: [], data: {} };
    const data: Record<number, Record<number, number>> = {};
    results.years.forEach((y, yi) => {
      data[y] = {};
      for (let m = 0; m < 12; m++) {
        data[y][m] = results.portMonthly[yi * 12 + m] ?? 0;
      }
    });
    return { years: results.years, data };
  };

  const m = results?.metrics as Record<string, number> | undefined;
  const bm = results?.bmMetrics as Record<string, number> | undefined;
  const bmLabel = settings.benchmark !== 'none' ? settings.benchmark : 'Benchmark';

  // ---- Render ----
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <div className="flex h-screen overflow-hidden">

        {/* ==============================
            LEFT PANEL — 340 px
        ============================== */}
        <aside className="w-[340px] min-w-[340px] bg-[#131929] border-r border-[#1e2d45] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#1e2d45] flex-shrink-0">
            <h1 className="text-lg font-bold text-white">Portfolio Performance</h1>
            <p className="text-xs text-slate-400 mt-0.5">Backtest any portfolio 2000–2024</p>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* ---- Holdings Section ---- */}
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Portfolio Holdings
              </h2>

              {/* Visual weight bar */}
              {assets.filter((a) => a.symbol && a.weight > 0).length > 0 && (
                <div className="h-2 rounded-full overflow-hidden flex mb-3 bg-[#1e2d45]">
                  {assets
                    .filter((a) => a.symbol && a.weight > 0)
                    .map((a, i) => {
                      const denom = autoNorm ? Math.max(totalWeight, 1) : 100;
                      return (
                        <div
                          key={a.symbol + i}
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(a.weight / denom) * 100}%`,
                            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                          title={`${a.symbol}: ${a.weight}%`}
                        />
                      );
                    })}
                </div>
              )}

              {/* Asset rows */}
              <div className="space-y-2">
                {assets.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <input
                      type="text"
                      value={a.symbol}
                      onChange={(e) => updateSymbol(i, e.target.value)}
                      placeholder="SYMBOL"
                      className="flex-1 bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-2 py-1.5 text-sm text-white placeholder-slate-700 uppercase focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <div className="relative w-[76px]">
                      <input
                        type="number"
                        value={a.weight}
                        onChange={(e) => updateWeight(i, parseFloat(e.target.value) || 0)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-2 py-1.5 text-sm text-white text-right pr-5 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-600 pointer-events-none">%</span>
                    </div>
                    <button
                      onClick={() => removeAsset(i)}
                      className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={addAsset}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus size={12} /> Add Asset
                </button>
                <div className="flex-1" />
                <span className={`text-xs font-mono ${Math.abs(totalWeight - 100) < 0.5 ? 'text-green-400' : 'text-amber-400'}`}>
                  {totalWeight.toFixed(1)}% total
                </span>
              </div>

              {/* Auto-normalize toggle */}
              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <button
                  role="switch"
                  aria-checked={autoNorm}
                  onClick={() => {
                    if (!autoNorm) normalizeWeights();
                    setAutoNorm(!autoNorm);
                  }}
                  className={`relative w-8 h-4 rounded-full transition-colors focus:outline-none ${autoNorm ? 'bg-blue-600' : 'bg-[#2a3a55]'}`}
                >
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${autoNorm ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-xs text-slate-400">Auto-normalize to 100%</span>
              </label>
            </section>

            {/* ---- Settings Section ---- */}
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Settings
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Start Year</label>
                    <select
                      value={settings.startYear}
                      onChange={(e) => setSettings({ ...settings, startYear: parseInt(e.target.value) })}
                      className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      {Array.from({ length: 20 }, (_, i) => 2000 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">End Year</label>
                    <select
                      value={settings.endYear}
                      onChange={(e) => setSettings({ ...settings, endYear: parseInt(e.target.value) })}
                      className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      {Array.from({ length: 20 }, (_, i) => 2005 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Rebalancing</label>
                  <select
                    value={settings.rebalance}
                    onChange={(e) => setSettings({ ...settings, rebalance: e.target.value as PortfolioSettings['rebalance'] })}
                    className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Risk-Free Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={(settings.riskFreeRate * 100).toFixed(1)}
                      onChange={(e) => setSettings({ ...settings, riskFreeRate: parseFloat(e.target.value) / 100 || 0 })}
                      step={0.5}
                      min={0}
                      max={20}
                      className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-2 py-1.5 pr-6 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-600 pointer-events-none">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Benchmark</label>
                  <select
                    value={settings.benchmark}
                    onChange={(e) => setSettings({ ...settings, benchmark: e.target.value as PortfolioSettings['benchmark'] })}
                    className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="SPY">SPY — S&amp;P 500</option>
                    <option value="QQQ">QQQ — NASDAQ 100</option>
                    <option value="BND">BND — Total Bond</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Initial Amount</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">₹</span>
                    <input
                      type="number"
                      value={settings.initialAmount}
                      onChange={(e) => setSettings({ ...settings, initialAmount: parseInt(e.target.value) || 100000 })}
                      step={10000}
                      min={1000}
                      className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg pl-6 pr-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{formatIndianNumber(settings.initialAmount)}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Run button */}
          <div className="p-4 border-t border-[#1e2d45] flex-shrink-0">
            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <TrendingUp size={16} />
                  Run Analysis
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ==============================
            RIGHT PANEL — results
        ============================== */}
        <main className="flex-1 overflow-y-auto bg-[#0b0f1a] p-6 space-y-6">

          {/* Empty state */}
          {!results && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
              <div className="w-16 h-16 bg-[#131929] rounded-2xl flex items-center justify-center mb-4 border border-[#1e2d45]">
                <TrendingUp size={28} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-200 mb-2">Ready to Backtest</h2>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                Configure your portfolio holdings and settings on the left, then click{' '}
                <strong className="text-slate-300">Run Analysis</strong> to see full backtesting results.
              </p>
            </div>
          )}

          {/* Skeleton loaders */}
          {isLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
              <div className="bg-[#131929] border border-[#1e2d45] rounded-xl h-72 animate-pulse" />
              <div className="bg-[#131929] border border-[#1e2d45] rounded-xl h-52 animate-pulse" />
              <div className="bg-[#131929] border border-[#1e2d45] rounded-xl h-44 animate-pulse" />
            </div>
          )}

          {/* ---- Results ---- */}
          {results && !isLoading && m && (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <MetricCard
                  label="Total Return"
                  value={fmtPct(m.totalReturn)}
                  sub={`→ ${formatIndianNumber(results.portfolioValues[results.portfolioValues.length - 1])}`}
                  color={m.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                <MetricCard
                  label="CAGR"
                  value={fmtPct(m.cagr)}
                  sub={`${settings.startYear}–${settings.endYear} (${settings.endYear - settings.startYear}y)`}
                  color={m.cagr >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                <MetricCard
                  label="Max Drawdown"
                  value={fmtPct(m.maxDrawdown)}
                  sub={`${m.maxDrawdownDuration} month recovery`}
                  color="text-red-400"
                />
                <MetricCard
                  label="Sharpe Ratio"
                  value={fmtNum(m.sharpe)}
                  sub="vs risk-free rate"
                  color={m.sharpe >= 1 ? 'text-green-400' : m.sharpe >= 0.5 ? 'text-amber-400' : 'text-red-400'}
                />
                <MetricCard
                  label="Sortino Ratio"
                  value={fmtNum(m.sortino)}
                  sub="downside risk only"
                  color={m.sortino >= 1 ? 'text-green-400' : m.sortino >= 0.5 ? 'text-amber-400' : 'text-red-400'}
                />
                <MetricCard
                  label="Ann. Volatility"
                  value={fmtPct(m.annualizedVolatility)}
                  sub="annualised std dev"
                  color="text-slate-300"
                />
              </div>

              {/* Portfolio Growth Chart */}
              <div className="bg-[#131929] rounded-xl border border-[#1e2d45] p-5">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Portfolio Growth</h3>
                    <p className="text-xs text-slate-500">
                      {formatIndianNumber(settings.initialAmount)} → {formatIndianNumber(results.portfolioValues[results.portfolioValues.length - 1])}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setLogScale(!logScale)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${logScale ? 'bg-blue-600 border-blue-500 text-white' : 'border-[#1e2d45] text-slate-500 hover:text-slate-300 hover:border-[#2a3a55]'}`}
                    >
                      Log
                    </button>
                    {(['5Y', '10Y', '15Y', '20Y', 'Max'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeRange(t)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${timeRange === t ? 'bg-[#1a2235] border-blue-500 text-blue-400' : 'border-[#1e2d45] text-slate-500 hover:text-slate-300'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getGrowthChartData()}>
                    <defs>
                      <linearGradient id="gPort" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PORTFOLIO_COLOR} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PORTFOLIO_COLOR} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gBm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BENCHMARK_COLOR} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={BENCHMARK_COLOR} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                    <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis
                      scale={logScale ? 'log' : 'auto'}
                      domain={logScale ? ['auto', 'auto'] : undefined}
                      allowDataOverflow={logScale}
                      tickFormatter={formatYAxis}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      width={72}
                    />
                    <Tooltip
                      contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                      formatter={(v, name) => [formatIndianNumber(Number(v)), String(name)]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }} />
                    <Area type="monotone" dataKey="portfolio" name="Portfolio" stroke={PORTFOLIO_COLOR} fill="url(#gPort)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    {settings.benchmark !== 'none' && (
                      <Area type="monotone" dataKey="benchmark" name={bmLabel} stroke={BENCHMARK_COLOR} fill="url(#gBm)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} activeDot={{ r: 3 }} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Annual Returns Bar Chart */}
              <div className="bg-[#131929] rounded-xl border border-[#1e2d45] p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Annual Returns</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={getAnnualReturnsData()} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: '#64748b', fontSize: 10, angle: -45, textAnchor: 'end' }}
                      height={52}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }}
                      formatter={(v, name) => [`${Number(v).toFixed(2)}%`, String(name)]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 4 }} />
                    <ReferenceLine y={0} stroke="#334155" />
                    <Bar dataKey="portfolio" name="Portfolio" fill={PORTFOLIO_COLOR} radius={[2, 2, 0, 0]} />
                    {settings.benchmark !== 'none' && (
                      <Bar dataKey="benchmark" name={bmLabel} fill={BENCHMARK_COLOR} radius={[2, 2, 0, 0]} opacity={0.75} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Drawdown Chart */}
              <div className="bg-[#131929] rounded-xl border border-[#1e2d45] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={14} className="text-red-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Drawdown</h3>
                  <span className="ml-auto text-xs text-red-400 font-mono">{fmtPct(m.maxDrawdown)} max</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={getDrawdownData()}>
                    <defs>
                      <linearGradient id="gDrawdown" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                    <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: '#64748b', fontSize: 11 }} domain={[-80, 0]} />
                    <Tooltip
                      contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Drawdown']}
                    />
                    <ReferenceLine y={-20} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '-20%', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
                    <ReferenceLine y={-40} stroke="#ef4444" strokeDasharray="4 2" label={{ value: '-40%', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                    <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#gDrawdown)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Returns Heatmap */}
              <div className="bg-[#131929] rounded-xl border border-[#1e2d45] p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Monthly Returns Heatmap</h3>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th className="text-left text-slate-500 text-[11px] font-medium pb-2 pr-3 w-12">Year</th>
                        {MONTHS.map((mo) => (
                          <th key={mo} className="text-center text-slate-500 text-[11px] font-medium pb-2 w-12">{mo}</th>
                        ))}
                        <th className="text-center text-slate-500 text-[11px] font-medium pb-2 w-14">Ann.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const { years: hYears, data } = getMonthlyHeatmapData();
                        return hYears.map((y) => {
                          const annRet = results.annualReturns[y] ?? 0;
                          return (
                            <tr key={y}>
                              <td className="text-slate-400 pr-3 py-px font-mono text-[11px]">{y}</td>
                              {MONTHS.map((_, mi) => {
                                const v = data[y]?.[mi] ?? 0;
                                return (
                                  <td
                                    key={mi}
                                    className="text-center py-px"
                                    title={`${MONTHS[mi]} ${y}: ${fmtPct1(v)}`}
                                  >
                                    <span
                                      className="block rounded text-[10px] font-mono px-0.5 py-0.5 leading-tight"
                                      style={{ backgroundColor: heatmapColor(v), color: Math.abs(v) < 0.005 ? '#475569' : '#e2e8f0' }}
                                    >
                                      {fmtPct1(v)}
                                    </span>
                                  </td>
                                );
                              })}
                              <td className="text-center py-px pl-1">
                                <span
                                  className="block rounded text-[10px] font-mono font-semibold px-0.5 py-0.5 leading-tight"
                                  style={{ backgroundColor: heatmapColor(annRet), color: annRet >= 0 ? '#86efac' : '#fca5a5' }}
                                >
                                  {fmtPct1(annRet)}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full Statistics Table */}
              <div className="bg-[#131929] rounded-xl border border-[#1e2d45] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200">Full Statistics</h3>
                  <button
                    onClick={() => setExpandedStats(!expandedStats)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {expandedStats ? '▲ Collapse' : '▼ Expand all'}
                  </button>
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2d45]">
                      <th className="text-left text-slate-500 font-medium pb-2">Metric</th>
                      <th className="text-right text-blue-400 font-medium pb-2">Portfolio</th>
                      {settings.benchmark !== 'none' && (
                        <th className="text-right text-amber-400 font-medium pb-2">{bmLabel}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131929]">
                    <SectionHeader label="Returns" span={settings.benchmark !== 'none' ? 3 : 2} />
                    {[
                      ['CAGR',       fmtPct(m.cagr),               bm ? fmtPct(bm.cagr)       : null],
                      ['Best Year',  fmtPct(m.bestYear),            bm ? fmtPct(bm.bestYear)   : null],
                      ['Worst Year', fmtPct(m.worstYear),           bm ? fmtPct(bm.worstYear)  : null],
                      ['Best Month', fmtPct(m.bestMonth),           bm ? fmtPct(bm.bestMonth)  : null],
                      ['Worst Month',fmtPct(m.worstMonth),          bm ? fmtPct(bm.worstMonth) : null],
                      ['Win Rate',   `${(m.winRate*100).toFixed(1)}%`, bm ? `${(bm.winRate*100).toFixed(1)}%` : null],
                    ].map(([l, p, b]) => (
                      <StatRow key={l as string} label={l as string} port={p as string} bench={b as string|null} hasBench={settings.benchmark !== 'none'} />
                    ))}

                    <SectionHeader label="Risk" span={settings.benchmark !== 'none' ? 3 : 2} />
                    {[
                      ['Std Dev (Ann)',      fmtPct(m.annualizedVolatility),  bm ? fmtPct(bm.annualizedVolatility) : null],
                      ['Max Drawdown',       fmtPct(m.maxDrawdown),           bm ? fmtPct(bm.maxDrawdown)          : null],
                      ['Avg Drawdown',       fmtPct(m.avgDrawdown),           bm ? fmtPct(bm.avgDrawdown)          : null],
                      ['Max DD Duration',    `${m.maxDrawdownDuration} mo`,   bm ? `${bm.maxDrawdownDuration} mo`  : null],
                      ['Ulcer Index',        fmtNum(m.ulcerIndex),            bm ? fmtNum(bm.ulcerIndex)           : null],
                    ].map(([l, p, b]) => (
                      <StatRow key={l as string} label={l as string} port={p as string} bench={b as string|null} hasBench={settings.benchmark !== 'none'} />
                    ))}

                    <SectionHeader label="Risk-Adjusted" span={settings.benchmark !== 'none' ? 3 : 2} />
                    {[
                      ['Sharpe',      fmtNum(m.sharpe),                 bm ? fmtNum(bm.sharpe)   : null],
                      ['Sortino',     fmtNum(m.sortino),                bm ? fmtNum(bm.sortino)  : null],
                      ['Treynor',     fmtNum(m.treynor),                null],
                      ['Calmar',      fmtNum(m.calmar),                 bm ? fmtNum(bm.calmar)   : null],
                      ['Omega',       fmtNum(m.omega),                  null],
                      ['Martin (UPI)',fmtNum(m.martin),                 null],
                      ['Info Ratio',  fmtNum(m.informationRatio),       null],
                    ].map(([l, p, b]) => (
                      <StatRow key={l as string} label={l as string} port={p as string} bench={b as string|null} hasBench={settings.benchmark !== 'none'} />
                    ))}

                    {expandedStats && (
                      <>
                        <SectionHeader label="Distribution" span={settings.benchmark !== 'none' ? 3 : 2} />
                        {[
                          ['Skewness',        fmtNum(m.skewness),          bm ? fmtNum(bm.skewness)          : null],
                          ['Kurtosis',        fmtNum(m.kurtosis),          bm ? fmtNum(bm.kurtosis)          : null],
                          ['VaR 95% (Mo)',    fmtPct(-m.var95),            bm ? fmtPct(-bm.var95)            : null],
                          ['CVaR 95% (Mo)',   fmtPct(-m.cvar95),           bm ? fmtPct(-bm.cvar95)           : null],
                          ['Tail Ratio',      fmtNum(m.tailRatio),         bm ? fmtNum(bm.tailRatio)         : null],
                          ['Gain/Loss Ratio', fmtNum(m.gainLossRatio),     bm ? fmtNum(bm.gainLossRatio)     : null],
                        ].map(([l, p, b]) => (
                          <StatRow key={l as string} label={l as string} port={p as string} bench={b as string|null} hasBench={settings.benchmark !== 'none'} />
                        ))}

                        <SectionHeader label="Factor" span={settings.benchmark !== 'none' ? 3 : 2} />
                        {[
                          ['Beta',             fmtNum(m.beta),                    bm ? '1.00'                                      : null],
                          ['Alpha (Ann)',       fmtPct(m.alpha),                   bm ? '—'                                         : null],
                          ['R²',               fmtNum(m.rSquared),                bm ? '1.00'                                      : null],
                          ['Tracking Error',   fmtPct(m.trackingError),           null],
                          ['Batting Average',  `${(m.battingAverage*100).toFixed(1)}%`,  bm ? `${(bm.battingAverage*100).toFixed(1)}%` : null],
                          ['Active Return',    fmtPct(m.activeReturn),            null],
                        ].map(([l, p, b]) => (
                          <StatRow key={l as string} label={l as string} port={p as string} bench={b as string|null} hasBench={settings.benchmark !== 'none'} />
                        ))}
                      </>
                    )}
                  </tbody>
                </table>

                {!expandedStats && (
                  <button
                    onClick={() => setExpandedStats(true)}
                    className="mt-3 w-full py-2 text-xs text-slate-600 hover:text-slate-400 border border-dashed border-[#1e2d45] rounded-lg transition-colors"
                  >
                    Show Distribution &amp; Factor metrics…
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ label, span }: { label: string; span: number }) {
  return (
    <tr>
      <td colSpan={span} className="pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
        {label}
      </td>
    </tr>
  );
}
