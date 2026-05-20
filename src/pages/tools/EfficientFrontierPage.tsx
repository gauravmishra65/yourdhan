import { useMemo, useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, CartesianGrid, LineChart, Line } from 'recharts'
import { efficientFrontier, maxSharpeWeights, minimumVarianceWeights, portfolioExpectedReturn, portfolioVolatility, sharpeRatio } from '../../lib/finance'

const ASSETS = [
  { symbol: 'SPY', name: 'US Large Cap', expRet: 0.10 },
  { symbol: 'QQQ', name: 'US Tech', expRet: 0.12 },
  { symbol: 'IWM', name: 'US Small Cap', expRet: 0.09 },
  { symbol: 'EFA', name: 'Intl Dev', expRet: 0.07 },
  { symbol: 'BND', name: 'Bonds', expRet: 0.04 },
  { symbol: 'GLD', name: 'Gold', expRet: 0.06 },
]
const COV = [
  [0.0361,0.0312,0.0299,0.0258,0.0007,0.0009],
  [0.0312,0.0506,0.0290,0.0234,0.0005,0.0010],
  [0.0299,0.0290,0.0441,0.0242,0.0010,0.0007],
  [0.0258,0.0234,0.0242,0.0361,0.0011,0.0008],
  [0.0007,0.0005,0.0010,0.0011,0.0016,0.0002],
  [0.0009,0.0010,0.0007,0.0008,0.0002,0.0225],
]
const RF = 0.06

function fmt(v: number) { return `${(v * 100).toFixed(1)}%` }

export default function EfficientFrontierPage() {
  const expRets = ASSETS.map(a => a.expRet)
  const frontier = useMemo(() => efficientFrontier(expRets, COV, 80), [])
  const msW = useMemo(() => maxSharpeWeights(expRets, COV, RF), [])
  const mvW = useMemo(() => minimumVarianceWeights(COV), [])

  const ms = { ret: portfolioExpectedReturn(msW, expRets), vol: portfolioVolatility(msW, COV) }
  const mv = { ret: portfolioExpectedReturn(mvW, expRets), vol: portfolioVolatility(mvW, COV) }

  // Capital Market Line data points
  const cmlData = Array.from({ length: 20 }, (_, i) => {
    const vol = mv.vol + (i / 19) * (ms.vol * 2.5 - mv.vol)
    const ret = RF + (ms.ret - RF) / ms.vol * vol
    return { vol: vol * 100, ret: ret * 100 }
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Efficient Frontier</h1>
        <p className="text-slate-400 mt-1">The boundary of optimal portfolios — maximum expected return for any given level of risk</p>
      </div>

      {/* Main chart */}
      <div className="card p-5">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="text-lg font-semibold text-slate-200">Risk–Return Space</h2>
          <div className="flex gap-3 text-xs ml-auto">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Frontier</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Max Sharpe</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />Min Variance</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t border-dashed border-amber-400 inline-block" />CML</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">Assets: {ASSETS.map(a => a.symbol).join(', ')} | Risk-free rate: {fmt(RF)}</p>
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ left: 20, right: 30, top: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis type="number" dataKey="volatility" name="Volatility" tickFormatter={v => `${v.toFixed(1)}%`} domain={[2, 18]} tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Annualized Volatility (Risk)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12 }} />
            <YAxis type="number" dataKey="expectedReturn" name="Return" tickFormatter={v => `${v.toFixed(1)}%`} domain={[3, 15]} tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Expected Annual Return', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
              formatter={(v, n) => [`${Number(v).toFixed(2)}%`, n === 'volatility' ? 'Volatility' : 'Expected Return']} />
            <Scatter name="Efficient Frontier" data={frontier.map(p => ({ ...p, volatility: p.volatility * 100, expectedReturn: p.expectedReturn * 100 }))} fill="#3b82f6" opacity={0.8} r={4} />
            <ReferenceDot x={ms.vol * 100} y={ms.ret * 100} r={10} fill="#22c55e" stroke="white" strokeWidth={2}
              label={{ value: '★ Max Sharpe', position: 'top', fill: '#22c55e', fontSize: 11 }} />
            <ReferenceDot x={mv.vol * 100} y={mv.ret * 100} r={10} fill="#a855f7" stroke="white" strokeWidth={2}
              label={{ value: '★ Min Var', position: 'top', fill: '#a855f7', fontSize: 11 }} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Key portfolios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { label: 'Maximum Sharpe Portfolio', w: msW, m: ms, color: 'border-green-500/50 bg-green-900/10' },
          { label: 'Minimum Variance Portfolio', w: mvW, m: mv, color: 'border-purple-500/50 bg-purple-900/10' },
        ].map(({ label, w, m, color }) => (
          <div key={label} className={`card p-4 border ${color}`}>
            <h3 className="text-slate-200 font-semibold mb-3">{label}</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center"><div className="text-xl font-bold font-mono text-green-400">{fmt(m.ret)}</div><div className="text-xs text-slate-500">Return</div></div>
              <div className="text-center"><div className="text-xl font-bold font-mono text-amber-400">{fmt(m.vol)}</div><div className="text-xs text-slate-500">Volatility</div></div>
              <div className="text-center"><div className="text-xl font-bold font-mono text-blue-400">{sharpeRatio(m.ret, m.vol, RF).toFixed(2)}</div><div className="text-xs text-slate-500">Sharpe</div></div>
            </div>
            <div className="space-y-1">
              {ASSETS.map((a, i) => (
                <div key={a.symbol} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-slate-400 w-8">{a.symbol}</span>
                  <div className="flex-1 h-2 bg-[#0b0f1a] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(0, w[i]) * 100}%` }} />
                  </div>
                  <span className="font-mono text-slate-300 text-xs w-12 text-right">{(Math.max(0, w[i]) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
