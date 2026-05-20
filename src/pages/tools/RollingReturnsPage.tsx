import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { ANNUAL_RETURNS } from '../../data/mockData'
import { rollingReturn } from '../../lib/finance'

const YEARS = Object.keys(ANNUAL_RETURNS.SPY).map(Number).sort()
const SPY_RETS = YEARS.map(y => ANNUAL_RETURNS.SPY[y])
const PORTFOLIO_RETS = YEARS.map(y => ANNUAL_RETURNS.SPY[y] * 0.6 + ANNUAL_RETURNS.BND[y] * 0.4)

function RollingChart({ rets: retArr, window, label }: { rets: number[]; window: number; label: string }) {
  const rolling = useMemo(() => rollingReturn(retArr, window), [retArr, window])
  const data = YEARS.slice(window - 1).map((y, i) => ({
    year: y, [label]: +(rolling[i] * 100).toFixed(2), spyRolling: +(rollingReturn(SPY_RETS, window)[i] * 100).toFixed(2)
  }))
  const best = Math.max(...rolling) * 100
  const worst = Math.min(...rolling) * 100
  const avg = (rolling.reduce((a, b) => a + b, 0) / rolling.length) * 100

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-200 font-semibold">{window}Y Rolling Return</h3>
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-green-400">Best: +{best.toFixed(1)}%/yr</span>
          <span className="text-amber-400">Avg: {avg.toFixed(1)}%/yr</span>
          <span className="text-red-400">Worst: {worst.toFixed(1)}%/yr</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ left: 15, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
            formatter={(v, n) => [`${Number(v).toFixed(2)}%/yr`, n]} />
          <ReferenceLine y={0} stroke="#64748b" />
          <Line type="monotone" dataKey={label} stroke="#3b82f6" strokeWidth={2} dot={false} name="Portfolio" />
          <Line type="monotone" dataKey="spyRolling" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="SPY" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function RollingReturnsPage() {
  const [selected, setSelected] = useState<1|3|5|10>(3)
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Rolling Returns</h1>
        <p className="text-slate-400 mt-1">Annualized returns for rolling windows — reveals consistency across market cycles</p>
      </div>
      <div className="flex gap-2">
        <span className="text-slate-400 text-sm self-center mr-2">Quick view:</span>
        {([1,3,5,10] as const).map(n => (
          <button key={n} onClick={() => setSelected(n)} className={`px-4 py-1.5 rounded text-sm transition-colors ${selected===n?'bg-blue-600 text-white':'bg-[#131929] border border-[#1e2d45] text-slate-400'}`}>{n}Y</button>
        ))}
      </div>
      <RollingChart rets={PORTFOLIO_RETS} window={1} label="1Y Return" />
      <RollingChart rets={PORTFOLIO_RETS} window={3} label="3Y Return" />
      <RollingChart rets={PORTFOLIO_RETS} window={5} label="5Y Return" />
      <RollingChart rets={PORTFOLIO_RETS} window={10} label="10Y Return" />
      <div className="text-xs text-slate-500 flex gap-4">
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-500 inline-block" /> Portfolio (60/40)</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t-2 border-amber-400 border-dashed inline-block" /> SPY Benchmark</span>
      </div>
    </div>
  )
}
