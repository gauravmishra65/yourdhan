// ============================================================
// YourDhan – Create / Import Portfolio Modal
// Two tabs: "Build Manually" (search + weights) and "Import CSV"
// ============================================================
import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Plus, Trash2, Search, Upload, FileText,
  AlertCircle, CheckCircle2, ChevronDown, BarChart2
} from 'lucide-react'
import { searchUniverse, getBySymbol } from '../../data/stockUniverse'
import type { UniverseItem } from '../../data/stockUniverse'
import type { Asset } from '../../types'

// ── Types ────────────────────────────────────────────────────────────────────

interface PortfolioRow {
  symbol: string
  name:   string
  weight: number
}

interface CreatePortfolioModalProps {
  onClose:  () => void
  onApply:  (name: string, assets: Asset[]) => void
  initial?: { name: string; assets: Asset[] }
}

// ── CSV parser ───────────────────────────────────────────────────────────────
function parseCSV(raw: string): PortfolioRow[] {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  const header = lines[0].toLowerCase()
  const hasHeader = /symbol|ticker|name|weight|qty|quantity|price/i.test(header)
  const dataLines = hasHeader ? lines.slice(1) : lines

  const cols = header.split(/[,\t;]/).map(c => c.trim())
  const symbolIdx = Math.max(cols.findIndex(c => /symbol|ticker/i.test(c)), 0)
  const weightIdx = cols.findIndex(c => /weight|allocation|pct|percent/i.test(c))
  const qtyIdx    = cols.findIndex(c => /qty|quantity|shares|units/i.test(c))
  const priceIdx  = cols.findIndex(c => /price|avg|cost/i.test(c))

  const rows: PortfolioRow[] = []

  for (const line of dataLines) {
    const cells = line.split(/[,\t;]/).map(c => c.trim().replace(/^"|"$/g, ''))
    const symbol = cells[symbolIdx]?.toUpperCase()
    if (!symbol) continue

    let weight = 0
    if (weightIdx >= 0 && cells[weightIdx]) {
      weight = parseFloat(cells[weightIdx].replace('%', '')) || 0
    } else if (qtyIdx >= 0 && priceIdx >= 0 && cells[qtyIdx] && cells[priceIdx]) {
      weight = (parseFloat(cells[qtyIdx]) || 0) * (parseFloat(cells[priceIdx]) || 0)
    } else if (qtyIdx >= 0 && cells[qtyIdx]) {
      weight = parseFloat(cells[qtyIdx]) || 0
    }

    const meta = getBySymbol(symbol)
    rows.push({ symbol, name: meta?.name ?? symbol, weight })
  }

  const total = rows.reduce((s, r) => s + r.weight, 0)
  if (total > 0) {
    rows.forEach(r => { r.weight = Math.round((r.weight / total) * 10000) / 100 })
  } else {
    const eq = Math.round((100 / rows.length) * 100) / 100
    rows.forEach(r => { r.weight = eq })
  }

  return rows
}

// ── Portal dropdown ───────────────────────────────────────────────────────────
interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  children: React.ReactNode
}

function DropdownPortal({ anchorRef, open, children }: DropdownPortalProps) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 2, left: rect.left, width: rect.width })
    }
  }, [open, anchorRef])

  if (!open) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
      }}
      className="bg-[#131929] border border-[#1e2d45] rounded-lg shadow-2xl overflow-hidden"
    >
      {children}
    </div>,
    document.body
  )
}

// ── Symbol search with portal dropdown ────────────────────────────────────────
function SymbolSearch({
  value, onChange, onSelect, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (item: UniverseItem) => void
  placeholder?: string
}) {
  const [open, setOpen]       = useState(false)
  const [results, setResults] = useState<UniverseItem[]>([])
  const inputRef              = useRef<HTMLInputElement>(null)
  const wrapRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const r = searchUniverse(value, 8)
    setResults(r)
    setOpen(value.trim().length >= 1 && r.length > 0)
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Don't close if click is on a portal dropdown (fixed elements attached to body)
      const target = e.target as HTMLElement
      if (target.closest('[data-symbol-dropdown]')) return
      if (wrapRef.current && !wrapRef.current.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          className="w-full pl-8 pr-3 py-2 bg-[#0b0f1a] border border-[#1e2d45] rounded-lg text-sm text-slate-200
                     placeholder-slate-600 focus:outline-none focus:border-blue-500 uppercase transition-colors"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => value.trim().length >= 1 && results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? 'Search symbol or name…'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <DropdownPortal anchorRef={inputRef} open={open}>
        <div data-symbol-dropdown="true">
          {results.map(item => (
            <button
              key={item.symbol}
              onMouseDown={(e) => {
                e.preventDefault()  // prevent input blur
                onSelect(item)
                setOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1e2d45] transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-100 text-xs">{item.symbol}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    item.type === 'MF'  ? 'bg-purple-900/50 text-purple-300' :
                    item.type === 'ETF' ? 'bg-teal-900/50 text-teal-300' :
                    'bg-blue-900/50 text-blue-300'
                  }`}>{item.type}</span>
                  <span className="text-[10px] text-slate-600">{item.exchange}</span>
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{item.name}</div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-xs font-mono text-slate-300">
                  ₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] font-mono ${item.chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.chg >= 0 ? '+' : ''}{item.chg.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </DropdownPortal>
    </div>
  )
}

// ── Colour constants ──────────────────────────────────────────────────────────
const COLORS = ['#3b82f6','#22c55e','#f59e0b','#a855f7','#06b6d4','#f43f5e','#10b981','#ec4899','#8b5cf6','#ef4444']

// ── Weight bar ────────────────────────────────────────────────────────────────
function WeightBar({ rows }: { rows: PortfolioRow[] }) {
  const total = rows.reduce((s, r) => s + r.weight, 0)
  if (total === 0) return null
  return (
    <div className="h-2.5 rounded-full overflow-hidden flex mt-2">
      {rows.filter(r => r.weight > 0).map((r, i) => (
        <div
          key={r.symbol}
          title={`${r.symbol}: ${r.weight.toFixed(1)}%`}
          style={{ width: `${(r.weight / total) * 100}%`, background: COLORS[i % COLORS.length] }}
        />
      ))}
    </div>
  )
}

// ── Quick templates ───────────────────────────────────────────────────────────
const TEMPLATES = [
  { label: 'NIFTY 50 Core', assets: [
    { symbol:'RELIANCE', weight:10 }, { symbol:'TCS', weight:10 }, { symbol:'HDFCBANK', weight:10 },
    { symbol:'INFY', weight:8 },      { symbol:'ICICIBANK', weight:8 }, { symbol:'LT', weight:8 },
    { symbol:'SBIN', weight:7 },      { symbol:'BHARTIARTL', weight:7 }, { symbol:'TITAN', weight:7 },
    { symbol:'SUNPHARMA', weight:6 }, { symbol:'AXISBANK', weight:6 }, { symbol:'ITC', weight:6 },
    { symbol:'MARUTI', weight:4 },    { symbol:'HCLTECH', weight:3 },
  ]},
  { label: 'IT Leaders', assets: [
    { symbol:'TCS', weight:25 },  { symbol:'INFY', weight:25 }, { symbol:'HCLTECH', weight:20 },
    { symbol:'WIPRO', weight:15 },{ symbol:'TECHM', weight:10 }, { symbol:'LTIM', weight:5 },
  ]},
  { label: 'Pharma + Healthcare', assets: [
    { symbol:'SUNPHARMA', weight:20 }, { symbol:'DRREDDY', weight:15 }, { symbol:'CIPLA', weight:15 },
    { symbol:'DIVISLAB', weight:15 },  { symbol:'APOLLOHOSP', weight:15 }, { symbol:'LUPIN', weight:10 },
    { symbol:'AUROPHARMA', weight:10 },
  ]},
  { label: 'Banking Focus', assets: [
    { symbol:'HDFCBANK', weight:25 }, { symbol:'ICICIBANK', weight:20 }, { symbol:'SBIN', weight:15 },
    { symbol:'KOTAKBANK', weight:15 }, { symbol:'AXISBANK', weight:12 }, { symbol:'INDUSINDBK', weight:8 },
    { symbol:'BANDHANBNK', weight:5 },
  ]},
  { label: 'Multi-Asset', assets: [
    { symbol:'NIFTYBEES', weight:30 }, { symbol:'GOLDBEES', weight:15 }, { symbol:'LIQUIDBEES', weight:10 },
    { symbol:'RELIANCE', weight:10 },  { symbol:'TCS', weight:10 }, { symbol:'HDFCBANK', weight:10 },
    { symbol:'PPFC001', weight:15 },
  ]},
]

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function CreatePortfolioModal({ onClose, onApply, initial }: CreatePortfolioModalProps) {
  const [tab, setTab]           = useState<'manual' | 'csv'>('manual')
  const [name, setName]         = useState(initial?.name ?? '')
  const [rows, setRows]         = useState<PortfolioRow[]>(
    initial?.assets.map(a => ({
      symbol: a.symbol,
      name:   getBySymbol(a.symbol)?.name ?? a.symbol,
      weight: a.weight,
    })) ?? []
  )
  const [searchQ, setSearchQ]   = useState('')
  const [csvText, setCsvText]   = useState('')
  const [csvError, setCsvError] = useState('')
  const [csvPreview, setCsvPreview] = useState<PortfolioRow[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const totalWeight = rows.reduce((s, r) => s + r.weight, 0)
  const weightOk    = Math.abs(totalWeight - 100) < 0.5

  // ── Manual handlers ──────────────────────────────────────────────────────
  const addFromSearch = useCallback((item: UniverseItem) => {
    setSearchQ('')
    setRows(prev => {
      if (prev.find(r => r.symbol === item.symbol)) return prev
      const next = [...prev, { symbol: item.symbol, name: item.name, weight: 0 }]
      const eq   = Math.round((100 / next.length) * 100) / 100
      return next.map(r => ({ ...r, weight: eq }))
    })
  }, [])

  const updateWeight = (i: number, w: number) =>
    setRows(rs => rs.map((r, idx) => idx === i ? { ...r, weight: Math.max(0, Math.min(100, w)) } : r))

  const removeRow = (i: number) =>
    setRows(prev => {
      const next = prev.filter((_, idx) => idx !== i)
      if (next.length === 0) return []
      const eq = Math.round((100 / next.length) * 100) / 100
      return next.map(r => ({ ...r, weight: eq }))
    })

  const equalizeWeights = () => {
    if (rows.length === 0) return
    const eq = Math.round((100 / rows.length) * 100) / 100
    setRows(rows.map(r => ({ ...r, weight: eq })))
  }

  const normalizeWeights = () => {
    if (totalWeight === 0) return
    setRows(rows.map(r => ({ ...r, weight: Math.round((r.weight / totalWeight) * 10000) / 100 })))
  }

  // ── CSV handlers ─────────────────────────────────────────────────────────
  const handleCSVChange = (text: string) => {
    setCsvText(text)
    setCsvError('')
    if (!text.trim()) { setCsvPreview([]); return }
    try {
      const parsed = parseCSV(text)
      if (parsed.length === 0) { setCsvError('No valid rows found.'); return }
      setCsvPreview(parsed)
    } catch {
      setCsvError('Parse error — check your CSV format.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => handleCSVChange(ev.target?.result as string ?? '')
    reader.readAsText(file)
  }

  // ── Template loader ───────────────────────────────────────────────────────
  const loadTemplate = (tpl: typeof TEMPLATES[0]) => {
    setRows(tpl.assets.map(a => ({
      symbol: a.symbol,
      name: getBySymbol(a.symbol)?.name ?? a.symbol,
      weight: a.weight,
    })))
    setName(tpl.label)
    setTab('manual')
  }

  // ── Apply ─────────────────────────────────────────────────────────────────
  const handleApply = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const assets: Asset[] = rows.filter(r => r.weight > 0).map(r => ({ symbol: r.symbol, weight: r.weight }))
    if (assets.length === 0) return
    onApply(trimmed, assets)
    onClose()
  }

  // ── Keyboard: Escape to close ─────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/75">
      <div className="bg-[#131929] border border-[#1e2d45] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d45] shrink-0">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-400" />
            <h2 className="font-semibold text-slate-100">
              {initial ? 'Edit Portfolio' : 'Create Portfolio'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* ── Name ── */}
        <div className="px-6 pt-4 shrink-0">
          <input
            className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded-lg px-3 py-2 text-sm text-slate-100
                       placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Portfolio name  (e.g. My NIFTY Core 2025)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* ── Templates ── */}
        <div className="px-6 pt-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 mr-1">Quick templates:</span>
            {TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => loadTemplate(t)}
                className="text-xs px-2.5 py-1 rounded-full border border-[#1e2d45] text-slate-400
                           hover:border-blue-500/60 hover:text-blue-400 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-6 pt-4 flex gap-4 border-b border-[#1e2d45] shrink-0">
          {(['manual', 'csv'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'manual' ? '🔍 Build Manually' : '📄 Import CSV'}
            </button>
          ))}
        </div>

        {/* ── Search (outside overflow div so portal aligns properly) ── */}
        {tab === 'manual' && (
          <div className="px-6 pt-4 shrink-0">
            <SymbolSearch
              value={searchQ}
              onChange={setSearchQ}
              onSelect={addFromSearch}
              placeholder="Search NSE/BSE stock, ETF, or mutual fund…"
            />
            {rows.length > 0 && <WeightBar rows={rows} />}
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {tab === 'manual' && (
            <div className="space-y-1">
              {rows.length > 0 ? (
                <>
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-1 mb-1 text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                    <span>Symbol / Name</span>
                    <span className="w-24 text-center">Weight %</span>
                    <span className="w-5" />
                    <span className="w-5" />
                  </div>

                  {/* Rows */}
                  {rows.map((row, i) => (
                    <div key={`${row.symbol}-${i}`}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-[#0b0f1a] rounded-lg px-3 py-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="font-mono font-semibold text-slate-200 text-sm">{row.symbol}</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate pl-4">{row.name}</div>
                      </div>
                      <div className="w-24">
                        <div className="relative">
                          <input
                            type="number"
                            min={0} max={100} step={0.1}
                            value={row.weight}
                            onChange={e => updateWeight(i, parseFloat(e.target.value) || 0)}
                            className="w-full text-right bg-[#131929] border border-[#1e2d45] rounded px-2 py-1
                                       text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const eq = Math.round(100 / rows.length * 100) / 100
                          updateWeight(i, eq)
                        }}
                        className="text-slate-600 hover:text-blue-400 transition-colors p-1"
                        title="Set equal weight"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button onClick={() => removeRow(i)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-10 text-center text-slate-600 border-2 border-dashed border-[#1e2d45] rounded-xl">
                  <Search size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Search and add stocks, ETFs, or mutual funds above</p>
                  <p className="text-xs mt-1">or pick a quick template</p>
                </div>
              )}

              {/* Weight actions */}
              {rows.length > 1 && (
                <div className="flex items-center gap-3 pt-2">
                  <div className={`flex-1 text-xs font-medium ${weightOk ? 'text-green-400' : 'text-amber-400'}`}>
                    {weightOk
                      ? <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Weights sum to 100%</span>
                      : <span className="flex items-center gap-1"><AlertCircle size={12}/> Sum: {totalWeight.toFixed(1)}%</span>
                    }
                  </div>
                  <button onClick={equalizeWeights} className="text-xs text-slate-500 hover:text-blue-400 transition-colors underline">
                    Equal weight
                  </button>
                  {!weightOk && (
                    <button onClick={normalizeWeights} className="text-xs text-slate-500 hover:text-blue-400 transition-colors underline">
                      Normalize to 100%
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'csv' && (
            <div className="space-y-4">
              {/* Upload dropzone */}
              <div
                className="border-2 border-dashed border-[#1e2d45] rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={24} className="mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-400">Drop CSV file here or <span className="text-blue-400 underline">browse</span></p>
                <p className="text-xs text-slate-600 mt-1">Supports .csv and .txt files</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </div>

              {/* Format guide */}
              <div className="bg-[#0b0f1a] rounded-lg p-3 text-xs text-slate-500 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1.5 mb-2">
                  <FileText size={13} /> Supported CSV formats:
                </div>
                <div className="font-mono text-slate-600">Symbol, Weight%</div>
                <div className="font-mono text-slate-600">Symbol, Qty, AvgPrice</div>
                <div className="font-mono text-slate-600">Just Tickers (equal-weighted)</div>
                <div className="mt-2 text-slate-500 italic">Example: RELIANCE,30 | TCS,25 | HDFCBANK,25 | INFY,20</div>
              </div>

              {/* Paste area */}
              <textarea
                className="w-full h-32 bg-[#0b0f1a] border border-[#1e2d45] rounded-lg p-3 text-sm
                           text-slate-300 font-mono placeholder-slate-700 resize-none
                           focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Or paste CSV content here…"
                value={csvText}
                onChange={e => handleCSVChange(e.target.value)}
              />

              {csvError && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
                  <AlertCircle size={13} /> {csvError}
                </div>
              )}

              {/* Preview */}
              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Preview — {csvPreview.length} holdings found</span>
                    <button
                      onClick={() => { setRows(csvPreview); setTab('manual') }}
                      className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      Use this data →
                    </button>
                  </div>
                  <WeightBar rows={csvPreview} />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {csvPreview.map((r, i) => (
                      <div key={r.symbol} className="flex items-center justify-between bg-[#0b0f1a] rounded px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="font-mono font-semibold text-slate-200 text-xs">{r.symbol}</span>
                          <span className="text-xs text-slate-500">{r.name}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-300">{r.weight.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-[#1e2d45] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            {rows.length > 0 && `${rows.length} holding${rows.length !== 1 ? 's' : ''}`}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!name.trim() || rows.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={14} />
              {initial ? 'Save Changes' : 'Create Portfolio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
