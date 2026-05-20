import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Globe, BarChart2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { MACRO, INDICES, MACRO_INDICATORS } from '../data/mockMacro'
import type { MacroIndicator } from '../data/mockMacro'

function ChangeChip({ v }: { v: number }) {
  if (v > 0) return <span className="flex items-center gap-1 text-green-400 font-mono text-sm font-semibold"><TrendingUp size={14} />+{v.toFixed(2)}%</span>
  if (v < 0) return <span className="flex items-center gap-1 text-red-400 font-mono text-sm font-semibold"><TrendingDown size={14} />{v.toFixed(2)}%</span>
  return <span className="flex items-center gap-1 text-slate-400 font-mono text-sm"><Minus size={14} />0.00%</span>
}

function IndexCard({ name, idx }: { name: string; idx: typeof INDICES[string] }) {
  const isUp = idx.changePct >= 0
  const fromHi = ((idx.value - idx.high52w) / idx.high52w) * 100
  const fromLo = ((idx.value - idx.low52w) / idx.low52w) * 100
  return (
    <div className={`card p-4 border-l-4 ${isUp ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{name}</span>
        <ChangeChip v={idx.changePct} />
      </div>
      <div className="text-2xl font-bold font-mono text-slate-100">
        {idx.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </div>
      <div className={`text-sm font-mono mt-0.5 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
        {isUp ? '+' : ''}{idx.change.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </div>
      <div className="mt-3 text-xs text-slate-600 flex justify-between">
        <span>52W H: {idx.high52w.toLocaleString('en-IN')}</span>
        <span>52W L: {idx.low52w.toLocaleString('en-IN')}</span>
      </div>
      <div className="mt-1 h-1.5 bg-[#0b0f1a] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-500 to-green-500 opacity-30 rounded-full" />
        <div className="relative h-0 -mt-1.5">
          <div className="absolute w-2 h-2 rounded-full bg-white border border-slate-800 -top-0.5"
            style={{ left: `${Math.max(0, Math.min(95, ((idx.value - idx.low52w) / (idx.high52w - idx.low52w)) * 100))}%` }} />
        </div>
      </div>
    </div>
  )
}

function IndicatorMiniChart({ ind }: { ind: MacroIndicator }) {
  const data = ind.history.slice(-12).map(h => ({ month: h.month.slice(5), value: h.value }))
  const isUp = ind.direction === 'up'
  const isDown = ind.direction === 'down'
  const color = isUp ? '#22c55e' : isDown ? '#ef4444' : '#94a3b8'
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 truncate">{ind.label}</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
            {ind.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            <span className="text-sm text-slate-500 ml-1">{ind.unit}</span>
          </div>
        </div>
        <div className={`text-xs font-mono ml-2 ${isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
          {ind.change > 0 ? '+' : ''}{ind.change.toFixed(2)}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={50}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-xs text-slate-600 mt-1">{ind.category}</div>
    </div>
  )
}

const INDIA_INDICES = ['NIFTY 50', 'SENSEX', 'NIFTY BANK', 'NIFTY IT', 'INDIA VIX', 'NIFTY MID', 'NIFTY SMALL', 'NIFTY FMCG', 'NIFTY AUTO', 'NIFTY PHARMA']
const GLOBAL_INDICES = ['S&P 500', 'NASDAQ', 'DOW JONES', 'HANG SENG', 'NIKKEI 225']
const CATEGORIES = ['All', 'Monetary Policy', 'Inflation', 'Growth', 'Business Activity', 'Capital Flows', 'Currency', 'Commodities', 'Interest Rates', 'Fiscal']

export default function MarketPage() {
  const [tab, setTab] = useState<'india' | 'global'>('india')
  const [cat, setCat] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const indices = tab === 'india' ? INDIA_INDICES : GLOBAL_INDICES
  const filteredIndicators = cat === 'All' ? MACRO_INDICATORS : MACRO_INDICATORS.filter(m => m.category === cat)

  const fmtCr = (v: number) => `₹${(v / 1e5).toFixed(0)}L Cr`

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
          <Globe size={28} className="text-blue-400" /> Market Overview
        </h1>
        <p className="text-slate-400 mt-1">Indian and global market indices, macro indicators, and economic data</p>
      </div>

      {/* Top macro strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'RBI Repo', val: `${(MACRO.repoRate * 100).toFixed(1)}%`, color: 'text-amber-400' },
          { label: 'CPI Inflation', val: `${(MACRO.cpi_yoy * 100).toFixed(1)}%`, color: 'text-red-400' },
          { label: 'USD/INR', val: MACRO.usd_inr.toFixed(2), color: 'text-slate-300' },
          { label: 'Brent Crude', val: `$${MACRO.crude_brent}`, color: 'text-amber-400' },
          { label: 'Gold/oz', val: `$${MACRO.gold_oz_usd.toLocaleString()}`, color: 'text-yellow-400' },
          { label: 'India VIX', val: INDICES['INDIA VIX'].value.toFixed(2), color: 'text-purple-400' },
        ].map(m => (
          <div key={m.label} className="card p-3 text-center">
            <div className={`text-lg font-bold font-mono ${m.color}`}>{m.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Indices section */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-400" /> Market Indices
          </h2>
          <div className="flex gap-2">
            {(['india', 'global'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-sm px-4 py-1.5 rounded capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-[#0b0f1a] border border-[#1e2d45] text-slate-400'}`}>
                {t === 'india' ? '🇮🇳 India' : '🌍 Global'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {indices.map(name => (
            <IndexCard key={name} name={name} idx={INDICES[name]} />
          ))}
        </div>
      </div>

      {/* Macro data */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Macro Indicators</h2>
          <div className="flex gap-2 flex-wrap justify-end">
            {CATEGORIES.slice(0, 5).map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`text-xs px-3 py-1 rounded ${cat === c ? 'bg-blue-600 text-white' : 'bg-[#131929] border border-[#1e2d45] text-slate-400'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredIndicators.map(ind => (
            <div key={ind.id} onClick={() => setExpandedId(expandedId === ind.id ? null : ind.id)}
              className="cursor-pointer">
              <IndicatorMiniChart ind={ind} />
              {expandedId === ind.id && (
                <div className="card p-4 mt-1 border border-blue-500/30 -mt-1 rounded-t-none">
                  <p className="text-xs text-slate-400 mb-3">{ind.description}</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={ind.history.map(h => ({ month: h.month.slice(5, 7) + '/' + h.month.slice(2, 4), value: h.value }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 9 }} interval={3} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 6 }}
                        formatter={(v) => [`${Number(v).toFixed(2)} ${ind.unit}`, ind.label]} />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="bg-[#0b0f1a] rounded p-2">
                      <span className="text-slate-500">Previous</span>
                      <div className="font-mono text-slate-300">{ind.prevValue} {ind.unit}</div>
                    </div>
                    <div className="bg-[#0b0f1a] rounded p-2">
                      <span className="text-slate-500">Change</span>
                      <div className={`font-mono ${ind.change > 0 ? 'text-green-400' : ind.change < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {ind.change > 0 ? '+' : ''}{ind.change.toFixed(2)} ({ind.changePct.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FII/DII flows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-3">Institutional Flows (YTD)</h3>
          <div className="space-y-4">
            {[
              { label: 'FII Net Buying', val: MACRO.fii_net_buy_ytd, color: 'bg-green-500' },
              { label: 'DII Net Buying', val: MACRO.dii_net_buy_ytd, color: 'bg-blue-500' },
            ].map(f => (
              <div key={f.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">{f.label}</span>
                  <span className={`font-mono font-semibold ${f.val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{(f.val / 100).toFixed(0)} Cr
                  </span>
                </div>
                <div className="h-2 bg-[#0b0f1a] rounded-full overflow-hidden">
                  <div className={`h-full ${f.color} rounded-full`} style={{ width: `${Math.min(100, Math.abs(f.val) / 700)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-3">Market Valuation</h3>
          <div className="space-y-3">
            {[
              { label: 'NSE P/E Ratio', val: MACRO.nse_pe.toFixed(1), note: 'Historical avg ~22x', color: 'text-amber-400' },
              { label: 'NSE P/B Ratio', val: MACRO.nse_pb.toFixed(2) + 'x', note: 'Price to Book', color: 'text-slate-300' },
              { label: 'Dividend Yield', val: (MACRO.nse_div_yield * 100).toFixed(2) + '%', note: 'Index dividend yield', color: 'text-green-400' },
              { label: 'Shiller CAPE', val: MACRO.shillerCAPE.toFixed(1), note: `Hist. mean ${MACRO.shillerHistoricalMean}`, color: 'text-amber-400' },
              { label: "Buffett Indicator", val: MACRO.buffettIndicator.toFixed(1) + '%', note: 'Mkt Cap / GDP', color: 'text-red-400' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-slate-400">{m.label}</span>
                  <span className="text-xs text-slate-600 ml-2">{m.note}</span>
                </div>
                <span className={`font-mono font-semibold ${m.color}`}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
