import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, CartesianGrid } from 'recharts'
import { ANNUAL_RETURNS } from '../../data/mockData'
import { drawdownSeries, maxDrawdown, averageDrawdown, painIndex, painRatio, ulcerIndex, recoveryFactor, cagr as cagrFn } from '../../lib/finance'

export default function DrawdownAnalysisPage() {
  const years = Object.keys(ANNUAL_RETURNS.SPY).map(Number).sort()
  const prices = useMemo(() => {
    let v = 100
    return years.map(y => { v *= (1 + ANNUAL_RETURNS.SPY[y]); return { year: y, price: v } })
  }, [])
  const priceArr = prices.map(p => p.price)
  const ddSeries = useMemo(() => drawdownSeries(priceArr), [priceArr])
  const chartData = years.map((y, i) => ({ year: y, drawdown: +(ddSeries[i] * 100).toFixed(2) }))

  const mdd = maxDrawdown(priceArr)
  const avgDD = averageDrawdown(priceArr)
  const pi = painIndex(priceArr)
  const ui = ulcerIndex(priceArr)
  const cagrVal = cagrFn(priceArr[0], priceArr[priceArr.length - 1], years.length)
  const pr = painRatio(cagrVal, pi)
  const rf = recoveryFactor(cagrVal * years.length, Math.abs(mdd))

  // Find top drawdowns
  const topDrawdowns = useMemo(() => {
    const events: Array<{ start: number; end: number; depth: number }> = []
    let inDD = false, startIdx = 0, minVal = 0
    for (let i = 0; i < ddSeries.length; i++) {
      if (ddSeries[i] < 0 && !inDD) { inDD = true; startIdx = i; minVal = ddSeries[i] }
      else if (ddSeries[i] < 0 && inDD) { if (ddSeries[i] < minVal) minVal = ddSeries[i] }
      else if (ddSeries[i] >= -0.005 && inDD) { events.push({ start: years[startIdx], end: years[i], depth: minVal }); inDD = false }
    }
    return events.sort((a, b) => a.depth - b.depth).slice(0, 7)
  }, [ddSeries])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Drawdown Analysis</h1>
        <p className="text-slate-400 mt-1">Underwater equity curve and recovery analysis for SPY (2000–2024)</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Max Drawdown', val: `${(mdd*100).toFixed(1)}%`, color: 'text-red-400' },
          { label: 'Avg Drawdown', val: `${(avgDD*100).toFixed(1)}%`, color: 'text-red-300' },
          { label: 'Pain Index', val: (pi*100).toFixed(2), color: 'text-amber-400' },
          { label: 'Ulcer Index', val: ui.toFixed(2), color: 'text-amber-400' },
          { label: 'Pain Ratio', val: pr.toFixed(2), color: 'text-blue-400' },
          { label: 'Recovery Factor', val: rf.toFixed(2), color: 'text-green-400' },
        ].map(m => (
          <div key={m.label} className="card p-3 text-center">
            <div className={`text-xl font-bold font-mono ${m.color}`}>{m.val}</div>
            <div className="text-xs text-slate-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Drawdown chart */}
      <div className="card p-4">
        <h3 className="text-slate-200 font-semibold mb-3">Drawdown Series (SPY 2000–2024)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ left: 15, right: 10, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis domain={[-80, 5]} tickFormatter={v => `${v}%`} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
              formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Drawdown']} />
            <ReferenceLine y={0} stroke="#64748b" />
            <ReferenceLine y={-20} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '-20%', fill: '#f59e0b', fontSize: 10 }} />
            <ReferenceLine y={-40} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '-40%', fill: '#ef4444', fontSize: 10 }} />
            <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="#ef444430" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top drawdowns table */}
      <div className="card p-4">
        <h3 className="text-slate-200 font-semibold mb-3">Historical Drawdown Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">Start</th>
                <th className="text-left pb-2">Recovery</th>
                <th className="text-right pb-2">Max Depth</th>
                <th className="text-right pb-2">Duration (yrs)</th>
              </tr>
            </thead>
            <tbody>
              {topDrawdowns.map((dd, i) => (
                <tr key={i} className="border-b border-slate-800/40">
                  <td className="py-2 text-slate-500">{i + 1}</td>
                  <td className="py-2 font-mono text-slate-300">{dd.start}</td>
                  <td className="py-2 font-mono text-slate-300">{dd.end}</td>
                  <td className="py-2 text-right font-mono text-red-400">{(dd.depth * 100).toFixed(1)}%</td>
                  <td className="py-2 text-right font-mono text-slate-400">{dd.end - dd.start}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
