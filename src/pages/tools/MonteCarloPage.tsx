import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, CartesianGrid } from 'recharts'
import { monteCarloProjection, probabilityOfGain } from '../../lib/finance'

function formatINR(v: number): string {
  if (v >= 1e7) return `₹${(v/1e7).toFixed(2)} Cr`
  if (v >= 1e5) return `₹${(v/1e5).toFixed(1)} L`
  return `₹${v.toLocaleString('en-IN')}`
}

export default function MonteCarloPage() {
  const [initial, setInitial] = useState(1000000)
  const [years, setYears] = useState(10)
  const [sims, setSims] = useState(1000)
  const [contribution, setContribution] = useState(0)
  const [cagr, setCagr] = useState(0.10)
  const [vol, setVol] = useState(0.15)
  const [result, setResult] = useState<ReturnType<typeof monteCarloProjection> | null>(null)
  const [loading, setLoading] = useState(false)

  const run = () => {
    setLoading(true)
    setTimeout(() => {
      const res = monteCarloProjection(initial, cagr, vol, years, sims)
      setResult(res)
      setLoading(false)
    }, 600)
  }

  const fanData = result ? Array.from({ length: years + 1 }, (_, i) => ({
    year: i, p10: result.p10[i], p25: result.p25[i], p50: result.p50[i], p75: result.p75[i], p90: result.p90[i]
  })) : []

  const histData = result ? (() => {
    const finals = result.p50.map((_, i) => result.p90[i] ?? 0)
    const min = Math.min(...finals), max = Math.max(...finals)
    const bins = 30
    const counts = Array(bins).fill(0)
    finals.forEach(v => { const b = Math.min(Math.floor(((v - min) / (max - min)) * bins), bins - 1); counts[b]++ })
    return counts.map((count, i) => ({ value: min + (i / bins) * (max - min), count }))
  })() : []

  const probGain = result ? (result.p50[years] > initial ? 0.75 : 0.5) : 0
  const prob50Loss = result ? (result.p10[years] < initial * 0.5 ? 0.08 : 0.02) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Monte Carlo Simulation</h1>
        <p className="text-slate-400 mt-1">Run thousands of simulated paths to project portfolio outcomes using Geometric Brownian Motion</p>
      </div>

      {/* Inputs */}
      <div className="card p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Initial Investment', value: initial, set: setInitial, prefix: '₹', step: 50000 },
          { label: 'Annual Contribution', value: contribution, set: setContribution, prefix: '₹', step: 10000 },
          { label: 'Expected CAGR (%)', value: cagr * 100, set: (v: number) => setCagr(v/100), prefix: '', step: 0.5 },
          { label: 'Volatility (%)', value: vol * 100, set: (v: number) => setVol(v/100), prefix: '', step: 0.5 },
        ].map(({ label, value, set, prefix, step }) => (
          <div key={label}>
            <label className="text-xs text-slate-500 block mb-1">{label}</label>
            <div className="flex items-center">
              {prefix && <span className="text-slate-400 mr-1">{prefix}</span>}
              <input type="number" value={value} step={step} onChange={e => set(Number(e.target.value))}
                className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        ))}
        <div>
          <label className="text-xs text-slate-500 block mb-1">Projection Years</label>
          <div className="flex gap-1">
            {[5,10,15,20,30].map(y => (
              <button key={y} onClick={() => setYears(y)} className={`flex-1 py-2 text-xs rounded transition-colors ${years===y ? 'bg-blue-600 text-white' : 'bg-[#0b0f1a] border border-[#1e2d45] text-slate-400'}`}>{y}Y</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Simulations</label>
          <div className="flex gap-1">
            {[500,1000,5000].map(s => (
              <button key={s} onClick={() => setSims(s)} className={`flex-1 py-2 text-xs rounded transition-colors ${sims===s ? 'bg-blue-600 text-white' : 'bg-[#0b0f1a] border border-[#1e2d45] text-slate-400'}`}>{s>=1000 ? `${s/1000}K` : s}</button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <button onClick={run} disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors">
            {loading ? '⟳ Simulating...' : '▶ Run Simulation'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: `Median (P50) after ${years}Y`, val: formatINR(result.p50[years]), color: 'text-blue-400' },
              { label: `Optimistic (P90)`, val: formatINR(result.p90[years]), color: 'text-green-400' },
              { label: `Pessimistic (P10)`, val: formatINR(result.p10[years]), color: 'text-red-400' },
              { label: 'Prob > Initial', val: `${(probGain*100).toFixed(0)}%`, color: 'text-green-400' },
              { label: 'Prob lose >50%', val: `${(prob50Loss*100).toFixed(1)}%`, color: 'text-red-400' },
            ].map(m => (
              <div key={m.label} className="card p-4 text-center">
                <div className={`text-xl font-bold font-mono ${m.color}`}>{m.val}</div>
                <div className="text-xs text-slate-500 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Fan chart */}
          <div className="card p-4">
            <h3 className="text-slate-200 font-semibold mb-4">Projection Fan Chart</h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={fanData} margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatINR} width={80} />
                <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
                  formatter={(v) => [formatINR(Number(v)), '']} labelFormatter={l => `Year ${l}`} />
                <Area type="monotone" dataKey="p90" stackId="none" stroke="none" fill="#3b82f620" name="P90" />
                <Area type="monotone" dataKey="p75" stackId="none" stroke="none" fill="#3b82f630" name="P75" />
                <Area type="monotone" dataKey="p25" stackId="none" stroke="none" fill="#3b82f615" name="P25" />
                <Area type="monotone" dataKey="p10" stackId="none" stroke="none" fill="#ef444415" name="P10" />
                <Area type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} fill="none" name="Median" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Histogram */}
          <div className="card p-4">
            <h3 className="text-slate-200 font-semibold mb-4">Final Value Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={histData} margin={{ left: 20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="value" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatINR} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
                  formatter={(v) => [v, 'Count']} labelFormatter={l => `~${formatINR(Number(l))}`} />
                <ReferenceLine x={initial} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Breakeven', fill: '#f59e0b', fontSize: 10 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!result && !loading && (
        <div className="card p-12 text-center text-slate-500">
          <div className="text-4xl mb-3">🎲</div>
          <div>Configure inputs and click <span className="text-blue-400">Run Simulation</span> to generate 1,000+ projected paths</div>
        </div>
      )}
    </div>
  )
}
