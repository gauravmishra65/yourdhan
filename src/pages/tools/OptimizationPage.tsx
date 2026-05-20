import { useState, useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { efficientFrontier, maxSharpeWeights, minimumVarianceWeights, riskParityWeights, equalWeights, portfolioExpectedReturn, portfolioVolatility, sharpeRatio as calcSharpe } from '../../lib/finance'
import PremiumGate from '../../components/ui/PremiumGate'

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#a855f7','#06b6d4','#f43f5e']
const DEFAULT_ASSETS = [
  { symbol: 'SPY', expRet: 0.10 }, { symbol: 'QQQ', expRet: 0.12 },
  { symbol: 'BND', expRet: 0.04 }, { symbol: 'GLD', expRet: 0.06 }, { symbol: 'VNQ', expRet: 0.08 }
]
const DEFAULT_COV = [
  [0.0361,0.0312,0.0007,0.0009,0.0258],[0.0312,0.0506,0.0005,0.0010,0.0226],
  [0.0007,0.0005,0.0016,0.0002,0.0003],[0.0009,0.0010,0.0002,0.0225,0.0015],
  [0.0258,0.0226,0.0003,0.0015,0.0576]
]

function fmt(v: number, dec = 1): string { return `${(v*100).toFixed(dec)}%` }

export default function OptimizationPage() {
  const [tab, setTab] = useState<'maxSharpe'|'minVar'|'riskParity'>('maxSharpe')
  const assets = DEFAULT_ASSETS
  const expRets = assets.map(a => a.expRet)
  const cov = DEFAULT_COV
  const RF = 0.06

  const frontier = useMemo(() => efficientFrontier(expRets, cov, 60), [])
  const msW = useMemo(() => maxSharpeWeights(expRets, cov, RF), [])
  const mvW = useMemo(() => minimumVarianceWeights(cov), [])
  const rpW = useMemo(() => riskParityWeights(cov), [])
  const eqW = useMemo(() => equalWeights(assets.length), [])

  function metrics(w: number[]) {
    const ret = portfolioExpectedReturn(w, expRets)
    const vol = portfolioVolatility(w, cov)
    return { ret, vol, sharpe: calcSharpe(ret, vol, RF) }
  }

  const currentWeights: Record<string, number[]> = { maxSharpe: msW, minVar: mvW, riskParity: rpW }
  const w = currentWeights[tab]
  const m = metrics(w)

  const pieData = assets.map((a, i) => ({ name: a.symbol, value: Math.round(w[i] * 1000) / 10 }))

  const specialPts = [
    { label: '★ Max Sharpe', ...metrics(msW), fill: '#22c55e' },
    { label: '★ Min Variance', ...metrics(mvW), fill: '#3b82f6' },
    { label: '★ Risk Parity', ...metrics(rpW), fill: '#a855f7' },
    { label: '★ Equal Weight', ...metrics(eqW), fill: '#f59e0b' },
  ]

  return (
    <PremiumGate toolName="Portfolio Optimization" description="Sign in for free to run Max Sharpe, Min Variance, and Risk Parity optimizations on your portfolio.">
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Portfolio Optimization</h1>
        <p className="text-slate-400 mt-1">Find the efficient frontier and optimal portfolio allocation using mean-variance optimization</p>
      </div>

      {/* Efficient Frontier */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Efficient Frontier</h2>
        <p className="text-xs text-slate-500 mb-4">Each point = a portfolio. Stars = optimal allocations. Curve = boundary of achievable risk/return.</p>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis type="number" dataKey="volatility" name="Volatility" tickFormatter={v => fmt(v)} domain={['auto','auto']}
              tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Volatility (Risk)', position: 'bottom', fill: '#64748b', fontSize: 12 }} />
            <YAxis type="number" dataKey="expectedReturn" name="Return" tickFormatter={v => fmt(v)} domain={['auto','auto']}
              tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Expected Return', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
              formatter={(v, n) => [fmt(Number(v)), n]} />
            <Scatter name="Frontier" data={frontier} fill="#3b82f6" opacity={0.7} r={3} />
            {specialPts.map(pt => (
              <ReferenceDot key={pt.label} x={pt.vol} y={pt.ret} r={8} fill={pt.fill} stroke="white" strokeWidth={2}
                label={{ value: pt.label.split(' ')[1], position: 'top', fill: pt.fill, fontSize: 10 }} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-2">
          {specialPts.map(pt => (
            <span key={pt.label} className="text-xs flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: pt.fill }} />
              <span className="text-slate-400">{pt.label}</span>
              <span className="font-mono text-slate-300">Ret={fmt(pt.ret)} Vol={fmt(pt.vol)} SR={pt.sharpe.toFixed(2)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2d45]">
        {[['maxSharpe','Max Sharpe'],['minVar','Min Variance'],['riskParity','Risk Parity']] .map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${tab===k ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>{l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pie */}
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-3">Suggested Allocation</h3>
          <div className="flex gap-4 items-center">
            <PieChart width={160} height={160}>
              <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
            <div className="space-y-1.5">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-mono text-slate-300 w-12">{d.name}</span>
                  <span className="font-mono text-slate-400">{d.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics + table */}
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Expected Return', val: fmt(m.ret), color: 'text-green-400' },
              { label: 'Expected Volatility', val: fmt(m.vol), color: 'text-amber-400' },
              { label: 'Sharpe Ratio', val: m.sharpe.toFixed(2), color: m.sharpe>1 ? 'text-green-400' : m.sharpe>0.5 ? 'text-amber-400' : 'text-red-400' },
            ].map(c => (
              <div key={c.label} className="text-center">
                <div className={`text-xl font-bold font-mono ${c.color}`}>{c.val}</div>
                <div className="text-xs text-slate-500">{c.label}</div>
              </div>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-slate-500 border-b border-slate-800"><th className="text-left pb-1">Symbol</th><th className="text-right pb-1">Weight</th><th className="text-right pb-1">Exp Ret</th></tr></thead>
            <tbody>
              {assets.map((a, i) => (
                <tr key={a.symbol} className="border-b border-slate-800/40">
                  <td className="py-1 font-mono text-slate-300">{a.symbol}</td>
                  <td className="py-1 text-right font-mono text-slate-300">{fmt(w[i])}</td>
                  <td className="py-1 text-right font-mono text-green-400">{fmt(a.expRet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </PremiumGate>
  )
}
