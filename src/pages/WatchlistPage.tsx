import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search, Star } from 'lucide-react'
import { useWatchlistStore } from '../store/watchlistStore'
import { MOCK_STOCKS } from '../data/mockStocks'

function ColoredPct({ v }: { v: number }) {
  const color = v > 0 ? 'text-green-400' : v < 0 ? 'text-red-400' : 'text-slate-400'
  return <span className={`font-mono font-semibold ${color}`}>{v > 0 ? '+' : ''}{v.toFixed(2)}%</span>
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 80, h = 32
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  const isUp = data[data.length - 1] >= data[0]
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth={1.5} />
    </svg>
  )
}

export default function WatchlistPage() {
  const { symbols, addSymbol, removeSymbol } = useWatchlistStore()
  const [search, setSearch] = useState('')
  const [addInput, setAddInput] = useState('')
  const [sortKey, setSortKey] = useState<'ticker' | 'price' | 'change'>('ticker')

  const watchedStocks = MOCK_STOCKS.filter(s => symbols.includes(s.ticker))
  const sorted = [...watchedStocks].sort((a, b) => {
    if (sortKey === 'ticker') return a.ticker.localeCompare(b.ticker)
    if (sortKey === 'price') return b.currentPrice - a.currentPrice
    const chg = (s: typeof a) => {
      const h = s.priceHistory
      if (h.length < 2) return 0
      return ((h[h.length - 1].close - h[h.length - 2].close) / h[h.length - 2].close) * 100
    }
    return chg(b) - chg(a)
  })
  const filtered = sorted.filter(s =>
    s.ticker.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const suggestions = MOCK_STOCKS.filter(s =>
    !symbols.includes(s.ticker) && addInput.length > 0 &&
    (s.ticker.toLowerCase().includes(addInput.toLowerCase()) || s.name.toLowerCase().includes(addInput.toLowerCase()))
  ).slice(0, 6)

  const notWatched = MOCK_STOCKS.filter(s => !symbols.includes(s.ticker)).slice(0, 6)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Star className="text-amber-400" size={28} /> Watchlist
          </h1>
          <p className="text-slate-400 mt-1">Track your favourite NSE stocks — {symbols.length} watched</p>
        </div>
        <Link to="/screener" className="btn-primary text-sm flex items-center gap-1">
          <Search size={14} /> Screener
        </Link>
      </div>

      {/* Add stock */}
      <div className="card p-4">
        <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
          <Plus size={16} className="text-blue-400" /> Add to Watchlist
        </h3>
        <div className="relative">
          <input value={addInput} onChange={e => setAddInput(e.target.value)}
            placeholder="Search ticker or company name..."
            className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500" />
          {addInput && suggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#131929] border border-[#1e2d45] rounded-lg shadow-xl overflow-hidden">
              {suggestions.map(s => (
                <button key={s.ticker} onClick={() => { addSymbol(s.ticker); setAddInput('') }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#1e2d45] text-left">
                  <div>
                    <span className="font-mono text-slate-200 font-semibold">{s.ticker}</span>
                    <span className="text-slate-500 text-sm ml-2">{s.name}</span>
                  </div>
                  <span className="font-mono text-slate-300 text-sm">₹{s.currentPrice.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {!addInput && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 self-center">Popular:</span>
            {notWatched.map(s => (
              <button key={s.ticker} onClick={() => addSymbol(s.ticker)}
                className="text-xs px-3 py-1 rounded-full bg-[#0b0f1a] border border-[#1e2d45] text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors">
                + {s.ticker}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter..."
              className="bg-[#0b0f1a] border border-[#1e2d45] rounded pl-8 pr-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500 w-48" />
          </div>
          <div className="flex gap-2">
            {(['ticker', 'price', 'change'] as const).map(k => (
              <button key={k} onClick={() => setSortKey(k)}
                className={`text-xs px-3 py-1 rounded ${sortKey === k ? 'bg-blue-600 text-white' : 'bg-[#0b0f1a] border border-[#1e2d45] text-slate-400'}`}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Star size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Your watchlist is empty</p>
            <p className="text-sm mt-1">Add stocks above to start tracking</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 text-xs uppercase tracking-wide">
                  <th className="text-left pb-2 pl-1">Stock</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">1D</th>
                  <th className="text-right pb-2 hidden md:table-cell">52W High</th>
                  <th className="text-right pb-2 hidden md:table-cell">52W Low</th>
                  <th className="text-right pb-2 hidden lg:table-cell">P/E</th>
                  <th className="text-center pb-2">6M</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const hist = s.priceHistory.slice(-6).map(p => p.close)
                  const last = s.priceHistory.at(-1)?.close ?? s.currentPrice
                  const prev = s.priceHistory.at(-2)?.close ?? last
                  const chgPct = ((last - prev) / prev) * 100
                  const hi52 = Math.max(...s.priceHistory.slice(-52).map(p => p.close))
                  const lo52 = Math.min(...s.priceHistory.slice(-52).map(p => p.close))
                  const pe = s.financials[0]?.eps > 0 ? (s.currentPrice / s.financials[0].eps).toFixed(1) : '—'

                  return (
                    <tr key={s.ticker} className="border-b border-slate-800/30 hover:bg-[#1a2540] transition-colors group">
                      <td className="py-3 pl-1">
                        <Link to={`/stocks/${s.ticker}`}>
                          <div className="font-mono font-semibold text-slate-100 hover:text-blue-400 transition-colors">{s.ticker}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[140px]">{s.name}</div>
                        </Link>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-200">₹{s.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right"><ColoredPct v={chgPct} /></td>
                      <td className="py-3 text-right font-mono text-slate-400 text-xs hidden md:table-cell">₹{hi52.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="py-3 text-right font-mono text-slate-400 text-xs hidden md:table-cell">₹{lo52.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="py-3 text-right font-mono text-slate-400 text-xs hidden lg:table-cell">{pe}</td>
                      <td className="py-3 text-center"><Sparkline data={hist} /></td>
                      <td className="py-3 text-right">
                        <button onClick={() => removeSymbol(s.ticker)}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 52W position bars */}
      {filtered.length > 0 && (
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-4">52-Week Price Position</h3>
          <div className="space-y-3">
            {filtered.map(s => {
              const hi52 = Math.max(...s.priceHistory.slice(-52).map(p => p.close))
              const lo52 = Math.min(...s.priceHistory.slice(-52).map(p => p.close))
              const pos = Math.max(0, Math.min(100, ((s.currentPrice - lo52) / (hi52 - lo52)) * 100))
              return (
                <div key={s.ticker} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-slate-400 w-20">{s.ticker}</span>
                  <span className="font-mono text-slate-500 w-14 text-right">₹{lo52.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <div className="flex-1 h-2 bg-[#0b0f1a] rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 opacity-20 rounded-full" />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500"
                      style={{ left: `calc(${pos}% - 6px)` }} />
                  </div>
                  <span className="font-mono text-slate-500 w-14">₹{hi52.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="font-mono text-slate-400 w-10 text-right">{pos.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
