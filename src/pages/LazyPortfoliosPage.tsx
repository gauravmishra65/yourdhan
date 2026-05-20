import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react'
import { LAZY_PORTFOLIOS } from '../data/mockData'

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#a855f7','#06b6d4','#f43f5e','#84cc16','#ec4899']

function AllocationBar({ holdings }: { holdings: Array<{ symbol: string; weight: number }> }) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden">
        {holdings.map((a, i) => (
          <div key={a.symbol} style={{ width: `${a.weight * 100}%`, background: COLORS[i % COLORS.length] }} title={`${a.symbol} ${(a.weight*100).toFixed(0)}%`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {holdings.map((a, i) => (
          <span key={a.symbol} className="flex items-center gap-1 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
            {a.symbol} {(a.weight * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  )
}

function PortfolioCard({ p, isCompared, onToggleCompare }: { p: typeof LAZY_PORTFOLIOS[0]; isCompared: boolean; onToggleCompare: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`card p-5 space-y-4 transition-all ${isCompared ? 'border-blue-500' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{p.name}</h3>
          <p className="text-sm text-slate-500 italic">{p.author}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isCompared} onChange={onToggleCompare} className="accent-blue-500" />
          <span className="text-xs text-slate-400">Compare</span>
        </label>
      </div>
      <p className="text-sm text-slate-400 line-clamp-2">{p.description}</p>
      <AllocationBar holdings={p.holdings} />
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-green-900/40 text-green-400">CAGR {p.cagr.toFixed(1)}%</span>
        <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-red-900/40 text-red-400">MaxDD {p.maxDrawdown.toFixed(0)}%</span>
        <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-blue-900/40 text-blue-400">Sharpe {p.sharpe.toFixed(2)}</span>
        <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-300">Vol {p.volatility.toFixed(1)}%</span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-200">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} More metrics
        </button>
        <Link to="/tools/portfolio-performance" className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
          Analyze <BarChart2 size={14} />
        </Link>
      </div>
      {expanded && (
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
          {[
            { label: 'Sortino', val: p.sortino.toFixed(2) },
            { label: 'Calmar', val: p.calmar.toFixed(2) },
            { label: 'Best Year', val: `${p.bestYear}` },
            { label: 'Worst Year', val: `${p.worstYear}` },
            { label: 'Win Rate', val: `${p.winRate.toFixed(0)}%` },
            { label: 'Ulcer Idx', val: p.ulcerIndex.toFixed(1) },
          ].map(m => (
            <div key={m.label}>
              <div className="text-slate-500">{m.label}</div>
              <div className="font-mono text-slate-300">{m.val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LazyPortfoliosPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'cagr' | 'sharpe' | 'maxDrawdown' | 'volatility'>('cagr')
  const [assetFilter, setAssetFilter] = useState<'all' | 2 | 3 | 4 | 5>('all')
  const [compared, setCompared] = useState<string[]>([])

  const filtered = useMemo(() => {
    let list = [...LAZY_PORTFOLIOS]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase()))
    if (assetFilter !== 'all') {
      if (assetFilter === 5) list = list.filter(p => p.holdings.length >= 5)
      else list = list.filter(p => p.holdings.length === assetFilter)
    }
    list.sort((a, b) => {
      if (sortBy === 'cagr') return b.cagr - a.cagr
      if (sortBy === 'sharpe') return b.sharpe - a.sharpe
      if (sortBy === 'maxDrawdown') return b.maxDrawdown - a.maxDrawdown
      return a.volatility - b.volatility
    })
    return list
  }, [search, sortBy, assetFilter])

  const toggleCompare = (id: string) => {
    setCompared(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const comparedPortfolios = LAZY_PORTFOLIOS.filter(p => compared.includes(p.id))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Lazy Portfolios</h1>
        <p className="text-slate-400 mt-1">12 battle-tested strategies from legendary investors — Bogle, Dalio, Browne & more</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search portfolios..."
            className="w-full pl-9 pr-4 py-2 bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500">
          <option value="cagr">Sort: CAGR ↓</option>
          <option value="sharpe">Sort: Sharpe ↓</option>
          <option value="maxDrawdown">Sort: Max DD ↓</option>
          <option value="volatility">Sort: Volatility ↑</option>
        </select>
        <div className="flex gap-1">
          {(['all', 2, 3, 4, 5] as const).map(n => (
            <button key={n} onClick={() => setAssetFilter(n)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${assetFilter === n ? 'bg-blue-600 text-white' : 'bg-[#131929] border border-[#1e2d45] text-slate-400 hover:border-slate-600'}`}>
              {n === 'all' ? 'All' : n === 5 ? '5+' : `${n}`} {n !== 'all' ? 'assets' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison panel */}
      {compared.length >= 2 && (
        <div className="card p-4 border-blue-500/50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-slate-200 font-semibold">Portfolio Comparison</h3>
            <button onClick={() => setCompared([])} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <td className="pb-2 pr-4">Metric</td>
                  {comparedPortfolios.map(p => <td key={p.id} className="pb-2 pr-4 font-medium text-slate-300">{p.name.split(' ').slice(0,2).join(' ')}</td>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[
                  { label: 'CAGR', fn: (p: typeof LAZY_PORTFOLIOS[0]) => `${p.cagr.toFixed(1)}%` },
                  { label: 'Max DD', fn: (p: typeof LAZY_PORTFOLIOS[0]) => `${p.maxDrawdown.toFixed(0)}%` },
                  { label: 'Sharpe', fn: (p: typeof LAZY_PORTFOLIOS[0]) => p.sharpe.toFixed(2) },
                  { label: 'Volatility', fn: (p: typeof LAZY_PORTFOLIOS[0]) => `${p.volatility.toFixed(1)}%` },
                  { label: 'Sortino', fn: (p: typeof LAZY_PORTFOLIOS[0]) => p.sortino.toFixed(2) },
                ].map(row => (
                  <tr key={row.label}>
                    <td className="py-2 pr-4 text-slate-500">{row.label}</td>
                    {comparedPortfolios.map(p => <td key={p.id} className="py-2 pr-4 font-mono text-slate-300">{row.fn(p)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(p => (
          <PortfolioCard key={p.id} p={p} isCompared={compared.includes(p.id)} onToggleCompare={() => toggleCompare(p.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">No portfolios match your filters</div>
      )}

      <div className="flex gap-2 items-center text-slate-400 text-sm">
        <TrendingUp size={16} className="text-green-400" />
        <span>All metrics based on 25-year backtest (2000–2024), annual rebalancing.</span>
        <TrendingDown size={16} className="text-red-400 ml-2" />
      </div>
    </div>
  )
}
