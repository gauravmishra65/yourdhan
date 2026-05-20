import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, ReferenceLine, CartesianGrid,
} from 'recharts'
import { Shield } from 'lucide-react'
import { ANNUAL_RETURNS, MONTHLY_RETURNS } from '../../data/mockData'
import {
  historicalVaR, parametricVaR, cvar, drawdownSeries, maxDrawdown,
  averageDrawdown, painIndex, skewness, kurtosis,
} from '../../lib/finance'

// ─── helpers ──────────────────────────────────────────────────────
function _mean(arr: number[]) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0 }
function _std(arr: number[]) {
  if (arr.length < 2) return 0
  const m = _mean(arr)
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1))
}
function _pct(arr: number[], p: number) {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx), hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}
function normalPDF(x: number, mu: number, sigma: number) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
}
function fp(v: number, d = 2) { return `${(Math.abs(v) * 100).toFixed(d)}%` }
function fps(v: number) { return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(2)}%` }

const SPY_MONTHLY = MONTHLY_RETURNS.map(r => r.spy)
const ANNUAL_SPY = Object.values(ANNUAL_RETURNS.SPY)
const SPY_PRICES = SPY_MONTHLY.reduce((acc: number[], r, i) => {
  acc.push(i === 0 ? 100 * (1 + r) : acc[i - 1] * (1 + r))
  return acc
}, [])

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2235]'}`}>
      {label}
    </button>
  )
}

function MetricCard({ label, value, sub, color = 'text-slate-100' }: {
  label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2235] border border-[#1e2d45] rounded-lg p-3 text-xs space-y-0.5">
      {label && <div className="text-slate-300 font-medium mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? p.fill ?? '#f1f5f9' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
        </div>
      ))}
    </div>
  )
}

// ─── VaR Tab ──────────────────────────────────────────────────────
function VaRTab() {
  const [conf, setConf] = useState(0.95)
  const [freq, setFreq] = useState<'daily' | 'monthly' | 'annual'>('monthly')
  const returns = freq === 'annual' ? ANNUAL_SPY : SPY_MONTHLY
  const m = _mean(returns)
  const s = _std(returns)
  const hVar = historicalVaR(returns, conf)
  const pVar = parametricVaR(m, s, conf)
  const cVar = cvar(returns, conf)

  const binCount = 30, binMin = -0.12, binMax = 0.12, bw = (binMax - binMin) / binCount
  const bins = Array.from({ length: binCount }, (_, i) => {
    const lo = binMin + i * bw, mid = lo + bw / 2
    return {
      bin: `${(mid * 100).toFixed(1)}%`,
      count: returns.filter(r => r >= lo && r < lo + bw).length,
      normal: +(normalPDF(mid, m, s) * bw * returns.length).toFixed(2),
    }
  })
  const sorted = [...returns].sort((a, b) => a - b)
  const stats = [
    { label: 'Mean', value: fps(m) },
    { label: 'Median', value: fps(_pct(returns, 50)) },
    { label: 'Std Dev', value: fp(s) },
    { label: 'Skewness', value: skewness(returns).toFixed(3) },
    { label: 'Kurtosis', value: kurtosis(returns).toFixed(3) },
    { label: 'Min', value: fps(sorted[0]) },
    { label: 'Max', value: fps(sorted[sorted.length - 1]) },
  ]
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1.5">Confidence Level</div>
          <div className="flex gap-1 bg-[#0b0f1a] rounded-lg p-1">
            {[0.90, 0.95, 0.99].map(c => (
              <button key={c} onClick={() => setConf(c)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                conf === c ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                {(c * 100).toFixed(0)}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1.5">Frequency</div>
          <div className="flex gap-1 bg-[#0b0f1a] rounded-lg p-1">
            {(['daily', 'monthly', 'annual'] as const).map(f => (
              <button key={f} onClick={() => setFreq(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                freq === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Historical VaR" value={fp(hVar)} sub={`${(conf*100).toFixed(0)}% confidence`} color="text-red-400" />
        <MetricCard label="Parametric VaR" value={fp(pVar)} sub="Normal distribution" color="text-amber-400" />
        <MetricCard label="CVaR / Exp. Shortfall" value={fp(cVar)} sub="Expected loss in tail" color="text-red-500" />
      </div>
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
        <div className="text-sm font-medium text-slate-300 mb-3">Return Distribution Histogram</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bins} margin={{ left: 10, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="bin" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="count" name="Frequency" fill="#3b82f6" opacity={0.75} radius={[2,2,0,0]} />
            <Line type="monotone" dataKey="normal" name="Normal Fit" stroke="#f59e0b" dot={false} strokeWidth={2} />
            <ReferenceLine x={`${(-hVar*100).toFixed(1)}%`} stroke="#ef4444" strokeDasharray="4 2"
              label={{ value: `VaR`, fill: '#ef4444', fontSize: 10, position: 'top' }} />
            <ReferenceLine x={`${(-cVar*100).toFixed(1)}%`} stroke="#f97316" strokeDasharray="4 2"
              label={{ value: 'CVaR', fill: '#f97316', fontSize: 10, position: 'top' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2d45] text-sm font-medium text-slate-300">
          Distribution Statistics — SPY ({freq})
        </div>
        <div className="grid grid-cols-7 divide-x divide-[#1e2d45]">
          {stats.map(s => (
            <div key={s.label} className="p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div className="text-sm font-semibold text-slate-200">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Drawdown Tab ─────────────────────────────────────────────────
function DrawdownTab() {
  const ddSeries = drawdownSeries(SPY_PRICES)
  const chartData = MONTHLY_RETURNS.map((r, i) => ({
    month: r.month, drawdown: +(ddSeries[i] * 100).toFixed(2),
  }))
  const mdd = maxDrawdown(SPY_PRICES)
  const avgDD = averageDrawdown(SPY_PRICES)
  const pi = painIndex(SPY_PRICES)

  const worstDD = useMemo(() => {
    const periods: { rank: number; start: string; trough: string; end: string; depth: string; duration: number; recovery: number }[] = []
    let peak = SPY_PRICES[0], peakIdx = 0, troughIdx = 0, troughVal = SPY_PRICES[0]
    for (let i = 1; i < SPY_PRICES.length; i++) {
      if (SPY_PRICES[i] < troughVal) { troughVal = SPY_PRICES[i]; troughIdx = i }
      if (SPY_PRICES[i] >= peak) {
        if (troughVal < peak * 0.85) {
          let recovEnd = i
          for (let j = troughIdx; j < SPY_PRICES.length; j++) {
            if (SPY_PRICES[j] >= peak) { recovEnd = j; break }
          }
          periods.push({
            rank: periods.length + 1,
            start: MONTHLY_RETURNS[peakIdx]?.month ?? '-',
            trough: MONTHLY_RETURNS[troughIdx]?.month ?? '-',
            end: MONTHLY_RETURNS[recovEnd]?.month ?? 'Ongoing',
            depth: `${((troughVal / peak - 1) * 100).toFixed(1)}%`,
            duration: troughIdx - peakIdx,
            recovery: recovEnd - troughIdx,
          })
        }
        peak = SPY_PRICES[i]; peakIdx = i; troughVal = SPY_PRICES[i]; troughIdx = i
      }
    }
    return periods.sort((a, b) => parseFloat(a.depth) - parseFloat(b.depth)).slice(0, 5).map((p, i) => ({ ...p, rank: i + 1 }))
  }, [])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Max Drawdown" value={fp(Math.abs(mdd))} sub="Peak-to-trough" color="text-red-400" />
        <MetricCard label="Avg Drawdown" value={fp(Math.abs(avgDD))} sub="Mean depth" color="text-amber-400" />
        <MetricCard label="Pain Index" value={fp(pi)} sub="Mean abs drawdown" color="text-orange-400" />
      </div>
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
        <div className="text-sm font-medium text-slate-300 mb-3">Underwater Equity Curve — SPY</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 5 }}>
            <defs>
              <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} interval={35} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[-70, 0]} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTip />} />
            <ReferenceLine y={0} stroke="#1e2d4580" />
            <Area type="monotone" dataKey="drawdown" name="Drawdown %" stroke="#ef4444" fill="url(#ddGrad)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2d45] text-sm font-medium text-slate-300">Top 5 Worst Drawdowns</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2d45]">
              {['#', 'Start', 'Trough', 'Recovery End', 'Depth', 'Duration (m)', 'Recovery (m)'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {worstDD.map(d => (
              <tr key={d.rank} className="border-b border-[#1e2d45]/40 hover:bg-[#1a2235] transition-colors">
                <td className="px-4 py-2.5 text-slate-400">#{d.rank}</td>
                <td className="px-4 py-2.5 text-slate-300">{d.start}</td>
                <td className="px-4 py-2.5 text-slate-300">{d.trough}</td>
                <td className="px-4 py-2.5 text-slate-300">{d.end}</td>
                <td className="px-4 py-2.5 font-semibold text-red-400">{d.depth}</td>
                <td className="px-4 py-2.5 text-slate-300">{d.duration}</td>
                <td className="px-4 py-2.5 text-green-400">{d.recovery}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Distribution Tab ─────────────────────────────────────────────
function erfinv(x: number) {
  const a = 0.147
  const ln = Math.log(1 - x * x)
  const t1 = 2 / (Math.PI * a) + ln / 2
  return Math.sign(x) * Math.sqrt(Math.sqrt(t1 * t1 - ln / a) - t1)
}

function DistributionTab() {
  const returns = SPY_MONTHLY
  const m = _mean(returns), s = _std(returns)
  const sk = skewness(returns), kurt = kurtosis(returns)

  const binCount = 30, bMin = -0.15, bMax = 0.15, bw = (bMax - bMin) / binCount
  const histData = Array.from({ length: binCount }, (_, i) => {
    const lo = bMin + i * bw, mid = lo + bw / 2
    return { bin: `${(mid * 100).toFixed(1)}%`, count: returns.filter(r => r >= lo && r < lo + bw).length }
  })

  const sorted = [...returns].sort((a, b) => a - b)
  const qqData = sorted.filter((_, i) => i % 3 === 0).map((r, i) => {
    const idx = i * 3
    const p = (idx + 0.5) / sorted.length
    const z = Math.sqrt(2) * erfinv(2 * p - 1)
    return { theoretical: +(z * s + m).toFixed(4), actual: +r.toFixed(4) }
  })

  const kurtBadge = kurt > 3 ? 'bg-red-900/40 text-red-400' : kurt > 1 ? 'bg-amber-900/40 text-amber-400' : 'bg-green-900/40 text-green-400'
  const skewBadge = Math.abs(sk) > 0.5 ? 'bg-amber-900/40 text-amber-400' : 'bg-green-900/40 text-green-400'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Excess Kurtosis</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${kurtBadge}`}>
              {kurt > 3 ? 'Fat Tails' : kurt > 1 ? 'Slight Excess' : 'Near Normal'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${kurt > 3 ? 'text-red-400' : kurt > 1 ? 'text-amber-400' : 'text-green-400'}`}>{kurt.toFixed(3)}</div>
          <div className="text-xs text-slate-500 mt-1">Normal distribution = 0 excess kurtosis</div>
        </div>
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Skewness</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${skewBadge}`}>
              {sk < -0.5 ? 'Left Skewed' : sk > 0.5 ? 'Right Skewed' : 'Near Symmetric'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${Math.abs(sk) > 0.5 ? 'text-amber-400' : 'text-green-400'}`}>{sk.toFixed(3)}</div>
          <div className="text-xs text-slate-500 mt-1">0 = perfectly symmetric</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="text-sm font-medium text-slate-300 mb-3">Monthly Return Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histData} margin={{ left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="bin" tick={{ fill: '#64748b', fontSize: 9 }} interval={5} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="count" name="Count" fill="#3b82f6" opacity={0.8} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="text-sm font-medium text-slate-300 mb-3">Q-Q Plot vs Normal</div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ left: 0, right: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="theoretical" name="Theoretical" type="number"
                tick={{ fill: '#64748b', fontSize: 9 }} domain={['auto','auto']}
                tickFormatter={v => `${(v*100).toFixed(1)}%`}
                label={{ value: 'Theoretical', fill: '#64748b', fontSize: 10, position: 'insideBottom', dy: 15 }} />
              <YAxis dataKey="actual" name="Actual" type="number"
                tick={{ fill: '#64748b', fontSize: 9 }}
                tickFormatter={v => `${(v*100).toFixed(1)}%`} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="bg-[#1a2235] border border-[#1e2d45] rounded-lg p-2 text-xs">
                    <div>Theoretical: {(d.theoretical*100).toFixed(2)}%</div>
                    <div>Actual: {(d.actual*100).toFixed(2)}%</div>
                  </div>
                )
              }} />
              <Scatter data={qqData} fill="#3b82f6" opacity={0.7} />
              {qqData.length > 1 && (
                <ReferenceLine stroke="#64748b" strokeDasharray="4 2"
                  segment={[
                    { x: qqData[0].theoretical, y: qqData[0].actual },
                    { x: qqData[qqData.length-1].theoretical, y: qqData[qqData.length-1].actual },
                  ]} />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Volatility Tab ───────────────────────────────────────────────
function VolatilityTab() {
  const window = 3
  const rollingVol = MONTHLY_RETURNS.map((r, i) => {
    if (i < window) return null
    const sl = SPY_MONTHLY.slice(i - window, i)
    return { month: r.month, vol: +(_std(sl) * Math.sqrt(12) * 100).toFixed(2) }
  }).filter(Boolean) as { month: string; vol: number }[]

  const avgVol = _mean(rollingVol.map(r => r.vol))
  const curVol = rollingVol[rollingVol.length - 1]?.vol ?? 0

  const coneWindows = [1, 3, 6, 12, 24, 36]
  const coneData = coneWindows.map(w => {
    const vols: number[] = []
    for (let i = w; i < SPY_MONTHLY.length; i++) {
      vols.push(_std(SPY_MONTHLY.slice(i - w, i)) * Math.sqrt(12) * 100)
    }
    vols.sort((a, b) => a - b)
    return {
      window: `${w}M`,
      p10: +_pct(vols, 10).toFixed(2),
      p25: +_pct(vols, 25).toFixed(2),
      p50: +_pct(vols, 50).toFixed(2),
      p75: +_pct(vols, 75).toFixed(2),
      p90: +_pct(vols, 90).toFixed(2),
    }
  })

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Current Vol (Ann.)" value={`${curVol.toFixed(1)}%`}
          sub="3-month rolling" color={curVol > avgVol * 1.2 ? 'text-red-400' : 'text-green-400'} />
        <MetricCard label="Historical Avg Vol" value={`${avgVol.toFixed(1)}%`}
          sub="2000–2024" color="text-amber-400" />
      </div>
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-slate-300">Rolling 3-Month Annualized Volatility</div>
          <div className="text-xs text-slate-500">SPY — Jan 2000–Dec 2024</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={rollingVol} margin={{ left: 10, right: 10, top: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} interval={35} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTip />} />
            <ReferenceLine y={avgVol} stroke="#f59e0b" strokeDasharray="4 2"
              label={{ value: 'Avg', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="vol" name="Volatility %" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
        <div className="text-sm font-medium text-slate-300 mb-1">Volatility Cone by Lookback Window</div>
        <div className="text-xs text-slate-500 mb-3">P10–P90 percentile bands across rolling windows</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={coneData} margin={{ left: 10, right: 10, top: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="window" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
            <Area type="monotone" dataKey="p90" name="P90" stroke="#3b82f640" fill="#3b82f615" strokeWidth={1} />
            <Area type="monotone" dataKey="p75" name="P75" stroke="#3b82f680" fill="#3b82f625" strokeWidth={1} />
            <Area type="monotone" dataKey="p50" name="Median" stroke="#3b82f6" fill="#3b82f640" strokeWidth={2} />
            <Area type="monotone" dataKey="p25" name="P25" stroke="#22c55e80" fill="#22c55e20" strokeWidth={1} />
            <Area type="monotone" dataKey="p10" name="P10" stroke="#22c55e40" fill="#22c55e10" strokeWidth={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────
type RiskTab = 'var' | 'drawdown' | 'dist' | 'vol'
export default function RiskAnalysisPage() {
  const [tab, setTab] = useState<RiskTab>('var')
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#f1f5f9] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/30 border border-red-800/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Risk Analysis</h1>
            <p className="text-sm text-slate-500">VaR, CVaR, drawdowns, distribution & volatility — SPY 2000–2024</p>
          </div>
        </div>
        <div className="flex gap-1 bg-[#131929] border border-[#1e2d45] rounded-xl p-1 w-fit">
          <TabBtn label="VaR / CVaR" active={tab === 'var'} onClick={() => setTab('var')} />
          <TabBtn label="Drawdown" active={tab === 'drawdown'} onClick={() => setTab('drawdown')} />
          <TabBtn label="Distribution" active={tab === 'dist'} onClick={() => setTab('dist')} />
          <TabBtn label="Volatility" active={tab === 'vol'} onClick={() => setTab('vol')} />
        </div>
        {tab === 'var' && <VaRTab />}
        {tab === 'drawdown' && <DrawdownTab />}
        {tab === 'dist' && <DistributionTab />}
        {tab === 'vol' && <VolatilityTab />}
      </div>
    </div>
  )
}
