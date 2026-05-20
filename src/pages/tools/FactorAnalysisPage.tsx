import { useState, useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, BarChart, Bar, Cell, CartesianGrid } from 'recharts'
import { ANNUAL_RETURNS } from '../../data/mockData'
import { betaCalc, jensensAlpha, rSquared, trackingError, rollingBeta, pearsonCorrelation } from '../../lib/finance'

const MARKET = ANNUAL_RETURNS.SPY
const YEARS = Object.keys(ANNUAL_RETURNS.SPY).map(Number).sort()
const PORTFOLIO_RETS = YEARS.map(y => ANNUAL_RETURNS.SPY[y] * 0.7 + ANNUAL_RETURNS.QQQ[y] * 0.3)
const MARKET_RETS = YEARS.map(y => MARKET[y])

export default function FactorAnalysisPage() {
  const [benchmark, setBenchmark] = useState('SPY')
  const RF = 0.06

  const beta = useMemo(() => betaCalc(PORTFOLIO_RETS, MARKET_RETS), [])
  const alpha = useMemo(() => jensensAlpha(0.112, 0.108, beta, RF), [beta])
  const r2 = useMemo(() => rSquared(PORTFOLIO_RETS, MARKET_RETS), [])
  const te = useMemo(() => trackingError(PORTFOLIO_RETS, MARKET_RETS), [])
  const rollingB = useMemo(() => rollingBeta(PORTFOLIO_RETS, MARKET_RETS, 5), [])

  const scatterData = YEARS.map((y, i) => ({ market: MARKET_RETS[i] * 100, portfolio: PORTFOLIO_RETS[i] * 100, year: y }))
  const rollingData = YEARS.slice(4).map((y, i) => ({ year: y, beta: rollingB[i] }))

  const factors = [
    { factor: 'Market (Beta)', exposure: beta - 1, color: beta > 1 ? '#ef4444' : '#3b82f6' },
    { factor: 'Size (SMB)', exposure: -0.15, color: '#3b82f6' },
    { factor: 'Value (HML)', exposure: 0.28, color: '#22c55e' },
    { factor: 'Momentum (MOM)', exposure: 0.12, color: '#22c55e' },
    { factor: 'Quality (QMJ)', exposure: 0.32, color: '#22c55e' },
  ]

  const betaColor = beta > 1.2 ? 'text-red-400' : beta < 0.8 ? 'text-green-400' : 'text-amber-400'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Factor Analysis</h1>
        <p className="text-slate-400 mt-1">Decompose portfolio returns into systematic risk factors — beta, alpha, and style tilts</p>
      </div>

      {/* Benchmark selector */}
      <div className="flex gap-2">
        {['SPY','QQQ','BND'].map(b => (
          <button key={b} onClick={() => setBenchmark(b)} className={`px-4 py-1.5 rounded text-sm font-mono transition-colors ${benchmark===b ? 'bg-blue-600 text-white' : 'bg-[#131929] border border-[#1e2d45] text-slate-400'}`}>{b}</button>
        ))}
        <span className="text-slate-500 text-sm ml-2 self-center">Benchmark</span>
      </div>

      {/* Factor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Beta (β)', val: beta.toFixed(3), color: betaColor, sub: beta>1.2?'High risk':'Moderate risk' },
          { label: 'Alpha (α) Ann.', val: `${alpha>0?'+':''}${(alpha*100).toFixed(2)}%`, color: alpha>0?'text-green-400':'text-red-400', sub: alpha>0?'Outperforms':'Underperforms' },
          { label: 'R² (Explained)', val: `${(r2*100).toFixed(1)}%`, color: 'text-blue-400', sub: `${(r2*100).toFixed(0)}% market-driven` },
          { label: 'Tracking Error', val: `${(te*100).toFixed(2)}%`, color: 'text-amber-400', sub: 'Annualized' },
          { label: 'Info Ratio', val: (alpha / te).toFixed(3), color: alpha/te>0?'text-green-400':'text-red-400', sub: alpha/te>0.5?'Good':'Modest' },
        ].map(c => (
          <div key={c.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${c.color}`}>{c.val}</div>
            <div className="text-xs text-slate-500 mt-1">{c.label}</div>
            <div className="text-xs text-slate-600">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Scatter + Rolling Beta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-1">Portfolio vs Market Returns</h3>
          <p className="text-xs text-slate-500 mb-3">Each point = 1 year. Slope = Beta = {beta.toFixed(2)}</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis type="number" dataKey="market" name="Market" tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: `${benchmark} Return`, position: 'bottom', fill: '#64748b', fontSize: 11 }} />
              <YAxis type="number" dataKey="portfolio" name="Portfolio" tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Portfolio Return', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
                formatter={(v, n) => [`${Number(v).toFixed(1)}%`, n]} labelFormatter={(_,p) => `Year ${p?.[0]?.payload?.year ?? ''}`} />
              <Scatter data={scatterData} fill="#3b82f6" opacity={0.8} />
              <ReferenceLine x={0} stroke="#1e2d45" />
              <ReferenceLine y={0} stroke="#1e2d45" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-1">Rolling 5-Year Beta</h3>
          <p className="text-xs text-slate-500 mb-3">How market sensitivity has changed over time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rollingData} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis domain={[0, 2]} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => v.toFixed(1)} />
              <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
                formatter={(v) => [Number(v).toFixed(3), 'Beta']} />
              <ReferenceLine y={1.0} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'β=1.0', fill: '#64748b', fontSize: 10 }} />
              <ReferenceLine y={0.9} stroke="#1e2d45" strokeDasharray="2 2" />
              <ReferenceLine y={1.1} stroke="#1e2d45" strokeDasharray="2 2" />
              <Line type="monotone" dataKey="beta" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Factor Exposure */}
      <div className="card p-4">
        <h3 className="text-slate-200 font-semibold mb-1">Factor Exposure</h3>
        <p className="text-xs text-slate-500 mb-3">Positive = tilted toward factor. Negative = tilted away. Relative to market.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={factors} layout="vertical" margin={{ left: 100, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" horizontal={false} />
            <XAxis type="number" domain={[-0.5, 0.5]} tickFormatter={v => v.toFixed(1)} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 11 }} width={95} />
            <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
              formatter={(v) => [Number(v).toFixed(3), 'Exposure']} />
            <ReferenceLine x={0} stroke="#64748b" />
            <Bar dataKey="exposure" radius={[0,3,3,0]}>
              {factors.map((f, i) => <Cell key={i} fill={f.exposure >= 0 ? '#3b82f6' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
