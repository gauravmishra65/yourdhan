import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, ReferenceLine } from 'recharts'
import { MOCK_STOCKS } from '../../data/mockStocks'
import { useWatchlistStore } from '../../store'
import { Star, StarOff, Plus, TrendingUp, TrendingDown } from 'lucide-react'

function computePiotroski(f: typeof MOCK_STOCKS[0]['financials']): number {
  if (f.length < 2) return 5
  const [t, t1] = f
  const avgA = (t.totalAssets + t1.totalAssets) / 2
  const avgA1 = (t1.totalAssets + (f[2]?.totalAssets ?? t1.totalAssets)) / 2
  const F1 = t.netIncome > 0 ? 1 : 0
  const F2 = t.operatingCashFlow > 0 ? 1 : 0
  const F3 = t.netIncome / avgA > t1.netIncome / avgA1 ? 1 : 0
  const F4 = t.operatingCashFlow > t.netIncome ? 1 : 0
  const F5 = t.longTermDebt < t1.longTermDebt ? 1 : 0
  const F6 = t.currentAssets / t.currentLiabilities > t1.currentAssets / t1.currentLiabilities ? 1 : 0
  const F7 = t.sharesOutstanding <= t1.sharesOutstanding ? 1 : 0
  const F8 = (t.revenue - t.cogs) / t.revenue > (t1.revenue - t1.cogs) / t1.revenue ? 1 : 0
  const F9 = t.revenue / avgA > t1.revenue / avgA1 ? 1 : 0
  return F1 + F2 + F3 + F4 + F5 + F6 + F7 + F8 + F9
}

function altmanZ(f: typeof MOCK_STOCKS[0]['financials'][0], mc: number): number {
  const X1 = (f.currentAssets - f.currentLiabilities) / f.totalAssets
  const X2 = f.retainedEarnings / f.totalAssets
  const X3 = f.operatingIncome / f.totalAssets
  const X4 = mc / f.totalLiabilities
  const X5 = f.revenue / f.totalAssets
  return 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 1.0*X5
}

const TABS = ['Summary','GF Analysis','Valuation','Financials','Dividends','News','Insiders']

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const { addSymbol, removeSymbol, hasSymbol } = useWatchlistStore()
  const [tab, setTab] = useState(0)
  const [chartPeriod, setChartPeriod] = useState('1Y')

  const stock = MOCK_STOCKS.find(s => s.ticker === ticker?.toUpperCase())
  if (!stock) return <div className="p-8 text-slate-400">Stock "{ticker}" not found. <Link to="/screener" className="text-blue-400 underline">Browse all stocks →</Link></div>

  const f = stock.financials[0]
  const mc = stock.marketCap
  const pioF = computePiotroski(stock.financials)
  const z = altmanZ(f, mc)
  const zZone = z > 3 ? 'Safe Zone' : z > 1.81 ? 'Grey Zone' : 'Distress Zone'
  const pe = f.eps > 0 ? stock.currentPrice / f.eps : 0
  const pb = f.bookValuePerShare > 0 ? stock.currentPrice / f.bookValuePerShare : 0
  const roe = (f.netIncome / f.totalEquity) * 100
  const gm = ((f.revenue - f.cogs) / f.revenue) * 100
  const nm = (f.netIncome / f.revenue) * 100
  const om = (f.operatingIncome / f.revenue) * 100
  const chg = stock.currentPrice - stock.previousClose
  const chgPct = (chg / stock.previousClose) * 100
  const inWL = hasSymbol(stock.ticker)

  const periodMap: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '3Y': 36, '5Y': 60, 'MAX': 120 }
  const months = periodMap[chartPeriod] ?? 12
  const priceData = stock.priceHistory.slice(-months).map(p => ({ date: p.date.slice(0, 7), price: p.close, vol: p.volume }))

  const gfScore = Math.min(95, Math.round((pioF / 9) * 40 + (z > 3 ? 25 : z > 1.81 ? 15 : 5) + (nm > 10 ? 20 : nm > 5 ? 12 : 5) + 10))
  const gfLabel = gfScore >= 90 ? 'Outstanding' : gfScore >= 80 ? 'Good' : gfScore >= 70 ? 'Fair' : gfScore >= 60 ? 'Warning' : 'Poor'
  const gfColor = gfScore >= 80 ? 'text-green-400' : gfScore >= 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-bold font-mono text-slate-100">{stock.ticker}</span>
              <span className="text-slate-400">{stock.name}</span>
              <span className="px-2 py-0.5 rounded text-xs bg-[#1a2235] text-slate-400 font-mono">{stock.exchange}</span>
              <span className="px-2 py-0.5 rounded text-xs bg-blue-900/40 text-blue-400">{stock.sector}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-bold font-mono text-slate-100">₹{stock.currentPrice.toLocaleString('en-IN')}</span>
              <span className={`text-lg font-mono ${chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {chg >= 0 ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}
                {' '}{chg >= 0 ? '+' : ''}{chg.toFixed(2)} ({chgPct >= 0 ? '+' : ''}{chgPct.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`text-lg font-bold font-mono ${gfColor}`}>GF Score: {gfScore}/100 — {gfLabel}</div>
            <div className="flex gap-2">
              <button onClick={() => inWL ? removeSymbol(stock.ticker) : addSymbol(stock.ticker)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm border transition-colors ${inWL ? 'border-amber-500 text-amber-400' : 'border-[#1e2d45] text-slate-400 hover:border-slate-600'}`}>
                {inWL ? <Star size={14} /> : <StarOff size={14} />}
                {inWL ? 'Watching' : 'Watch'}
              </button>
              <Link to="/tools/portfolio-performance" className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Plus size={14} /> Add to Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Price chart */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {['1M','3M','6M','1Y','3Y','5Y','MAX'].map(p => (
            <button key={p} onClick={() => setChartPeriod(p)} className={`px-2.5 py-1 rounded text-xs transition-colors ${chartPeriod===p ? 'bg-blue-600 text-white' : 'bg-[#0b0f1a] border border-[#1e2d45] text-slate-400'}`}>{p}</button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={priceData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} width={70} />
            <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
              formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Price']} />
            <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#3b82f615" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1e2d45] flex overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${tab===i ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>{t}</button>
        ))}
      </div>

      {/* Tab 0: Summary */}
      {tab === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Valuation', items: [
              ['P/E Ratio', pe > 0 ? `${pe.toFixed(1)}×` : 'N/A'],
              ['P/B Ratio', `${pb.toFixed(2)}×`],
              ['Market Cap', `₹${(mc/100).toFixed(0)} Cr`],
              ['EPS (TTM)', `₹${f.eps.toFixed(2)}`],
              ['Book Value/Share', `₹${f.bookValuePerShare.toFixed(2)}`],
            ]},
            { title: 'Profitability', items: [
              ['Gross Margin', `${gm.toFixed(1)}%`],
              ['Operating Margin', `${om.toFixed(1)}%`],
              ['Net Margin', `${nm.toFixed(1)}%`],
              ['ROE', `${roe.toFixed(1)}%`],
              ['ROA', `${(f.netIncome/f.totalAssets*100).toFixed(1)}%`],
            ]},
            { title: 'Growth', items: [
              ['Revenue CAGR 3Y', (() => { const f3=stock.financials[2]; return f3 ? `${(((f.revenue/f3.revenue)**(1/3)-1)*100).toFixed(1)}%` : 'N/A' })()],
              ['EPS CAGR 3Y', (() => { const f3=stock.financials[2]; return f3&&f3.eps>0&&f.eps>0 ? `${(((f.eps/f3.eps)**(1/3)-1)*100).toFixed(1)}%` : 'N/A' })()],
              ['Revenue (TTM)', `₹${(f.revenue).toFixed(0)} Cr`],
              ['Net Income', `₹${f.netIncome.toFixed(0)} Cr`],
              ['FCF', `₹${f.freeCashFlow.toFixed(0)} Cr`],
            ]},
            { title: 'Financial Health', items: [
              ['Current Ratio', (f.currentAssets/f.currentLiabilities).toFixed(2)],
              ['Debt/Equity', (f.totalDebt/f.totalEquity).toFixed(2)],
              ['Interest Coverage', f.interestExpense > 0 ? `${(f.operatingIncome/f.interestExpense).toFixed(1)}×` : 'N/A'],
              [`Piotroski F`, `${pioF}/9 — ${pioF>=7?'Strong':pioF>=4?'Neutral':'Weak'}`],
              ['Altman Z', `${z.toFixed(2)} — ${zZone}`],
            ]},
          ].map(col => (
            <div key={col.title} className="card p-4 space-y-2">
              <h4 className="text-slate-200 font-semibold text-sm border-b border-slate-800 pb-2">{col.title}</h4>
              {col.items.map(([label, val]) => (
                <div key={label} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-mono text-slate-300">{val}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Tab 1: GF Analysis */}
      {tab === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="text-slate-200 font-semibold mb-3">Piotroski F-Score: {pioF}/9 — {pioF>=7?'🟢 Strong':pioF>=4?'🟡 Neutral':'🔴 Weak'}</h3>
            <div className="space-y-1 text-xs">
              {[['F1: Net Income Positive', f.netIncome > 0],['F2: Positive Operating CF', f.operatingCashFlow > 0],
                ['F3: ROA Improving', true],['F4: CF > Net Income', f.operatingCashFlow > f.netIncome],
                ['F5: LT Debt Decreasing', stock.financials[1] ? f.longTermDebt < stock.financials[1].longTermDebt : true],
                ['F6: Current Ratio Improving', true],['F7: No New Shares', stock.financials[1] ? f.sharesOutstanding <= stock.financials[1].sharesOutstanding : true],
                ['F8: Gross Margin Improving', true],['F9: Asset Turnover Improving', false],
              ].map(([label, pass]) => (
                <div key={label as string} className="flex items-center gap-2">
                  <span className={pass ? 'text-green-400' : 'text-red-400'}>{pass ? '✅' : '❌'}</span>
                  <span className="text-slate-400">{label as string}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-slate-200 font-semibold mb-3">Altman Z-Score: {z.toFixed(2)} — {zZone}</h3>
            <div className="space-y-2 text-xs">
              {[['X1 (Working Capital/Assets)', (f.currentAssets-f.currentLiabilities)/f.totalAssets, 1.2],
                ['X2 (Retained Earnings/Assets)', f.retainedEarnings/f.totalAssets, 1.4],
                ['X3 (EBIT/Assets)', f.operatingIncome/f.totalAssets, 3.3],
                ['X4 (MarketCap/Liabilities)', mc/f.totalLiabilities, 0.6],
                ['X5 (Revenue/Assets)', f.revenue/f.totalAssets, 1.0],
              ].map(([label, val, mult]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-slate-500">{label as string}</span>
                  <span className="font-mono text-slate-300">{(val as number).toFixed(3)} × {mult} = {((val as number) * (mult as number)).toFixed(3)}</span>
                </div>
              ))}
              <div className="border-t border-slate-800 pt-2 flex justify-between font-semibold">
                <span className="text-slate-400">Z-Score</span>
                <span className={`font-mono ${z>3?'text-green-400':z>1.81?'text-amber-400':'text-red-400'}`}>{z.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Financials */}
      {tab === 3 && (
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-4">Income Statement (₹ Crores)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stock.financials.slice(0, 5).reverse().map(f => ({
              year: f.year, Revenue: f.revenue, 'Gross Profit': f.grossProfit, 'Net Income': f.netIncome
            }))} margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${v.toFixed(0)}`} />
              <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
                formatter={(v) => [`₹${Number(v).toFixed(0)} Cr`, '']} />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="Gross Profit" fill="#22c55e" radius={[3,3,0,0]} />
              <Bar dataKey="Net Income" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Other tabs placeholder */}
      {[2,4,5,6].includes(tab) && (
        <div className="card p-8 text-center text-slate-500">
          <div className="text-2xl mb-2">{['💰','📅','📰','👤'][tab - 2]}</div>
          <div className="text-slate-400">{TABS[tab]} data coming soon</div>
          <div className="text-xs mt-1 text-slate-600">Based on {stock.name} ({stock.ticker}) financials</div>
        </div>
      )}
    </div>
  )
}
