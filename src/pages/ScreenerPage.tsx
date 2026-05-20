import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Star, PlusCircle, ArrowRight, Download } from 'lucide-react';
import { ASSET_UNIVERSE, type Asset } from '../data/mockData';
import { useWatchlistStore } from '../store';

// ── helpers ───────────────────────────────────────────────────────────────────
function pct(v: number, digits = 1) {
  return (v >= 0 ? '+' : '') + v.toFixed(digits) + '%';
}
function fmtPrice(v: number) {
  return v >= 500 ? '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '$' + v.toFixed(2);
}
function fmtAUM(v: number) {
  if (v === 0) return '—';
  return '$' + v.toFixed(1) + 'B';
}

// ── RangeSlider ───────────────────────────────────────────────────────────────
interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  suffix?: string;
  step?: number;
}

function RangeSlider({ label, min, max, value, onChange, suffix = '%', step = 1 }: RangeSliderProps) {
  const leftPct = ((value[0] - min) / (max - min)) * 100;
  const rightPct = ((value[1] - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="text-[11px] text-blue-400 font-mono">
          {value[0]}{suffix}–{value[1]}{suffix}
        </span>
      </div>
      <div className="relative h-4 flex items-center select-none">
        <div className="absolute inset-x-0 h-[3px] bg-[#1e2d45] rounded" />
        <div
          className="absolute h-[3px] bg-blue-500 rounded"
          style={{ left: leftPct + '%', right: (100 - rightPct) + '%' }}
        />
        <input type="range" min={min} max={max} step={step} value={value[0]}
          onChange={e => { const v = +e.target.value; if (v <= value[1]) onChange([v, value[1]]); }}
          className="absolute inset-x-0 h-[3px] opacity-0 cursor-pointer z-10"
          style={{ pointerEvents: 'auto' }}
        />
        <input type="range" min={min} max={max} step={step} value={value[1]}
          onChange={e => { const v = +e.target.value; if (v >= value[0]) onChange([value[0], v]); }}
          className="absolute inset-x-0 h-[3px] opacity-0 cursor-pointer z-10"
          style={{ pointerEvents: 'auto' }}
        />
        <div className="absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-[#0b0f1a] pointer-events-none"
          style={{ left: `calc(${leftPct}% - 6px)` }} />
        <div className="absolute w-3 h-3 rounded-full bg-blue-400 border-2 border-[#0b0f1a] pointer-events-none"
          style={{ left: `calc(${rightPct}% - 6px)` }} />
      </div>
    </div>
  );
}

// ── Filter state ──────────────────────────────────────────────────────────────
interface Filters {
  types: Set<string>;
  return1y: [number, number];
  return3y: [number, number];
  return5y: [number, number];
  volatility: [number, number];
  sharpe: [number, number];
  expenseRatio: [number, number];
  dividendYield: [number, number];
  aumMin: number;
  sectors: Set<string>;
}

const DEFAULT_FILTERS: Filters = {
  types: new Set(['ETF', 'Stock', 'Bond']),
  return1y: [-50, 100],
  return3y: [-30, 50],
  return5y: [-20, 30],
  volatility: [0, 60],
  sharpe: [0, 3],
  expenseRatio: [0, 2],
  dividendYield: [0, 10],
  aumMin: 0,
  sectors: new Set<string>(),
};

function cloneF(f: Filters): Filters {
  return { ...f, types: new Set(f.types), sectors: new Set(f.sectors) };
}

const columnHelper = createColumnHelper<Asset>();

// ── ScreenerPage ──────────────────────────────────────────────────────────────
export default function ScreenerPage() {
  const [filters, setFilters] = useState<Filters>(cloneF(DEFAULT_FILTERS));
  const [pending, setPending] = useState<Filters>(cloneF(DEFAULT_FILTERS));
  const [sorting, setSorting] = useState<SortingState>([]);
  const { addSymbol, hasSymbol } = useWatchlistStore();

  const allSectors = useMemo(() => Array.from(new Set(ASSET_UNIVERSE.map(a => a.sector))).sort(), []);

  const filtered = useMemo(() => ASSET_UNIVERSE.filter(a => {
    if (!filters.types.has(a.type)) return false;
    if (a.return1y < filters.return1y[0] || a.return1y > filters.return1y[1]) return false;
    if (a.return3y < filters.return3y[0] || a.return3y > filters.return3y[1]) return false;
    if (a.return5y < filters.return5y[0] || a.return5y > filters.return5y[1]) return false;
    if (a.volatility < filters.volatility[0] || a.volatility > filters.volatility[1]) return false;
    if (a.sharpe < filters.sharpe[0] || a.sharpe > filters.sharpe[1]) return false;
    if (a.expenseRatio < filters.expenseRatio[0] || a.expenseRatio > filters.expenseRatio[1]) return false;
    if (a.dividendYield < filters.dividendYield[0] || a.dividendYield > filters.dividendYield[1]) return false;
    if (a.aum < filters.aumMin) return false;
    if (filters.sectors.size > 0 && !filters.sectors.has(a.sector)) return false;
    return true;
  }), [filters]);

  const columns = useMemo(() => [
    columnHelper.accessor('symbol', {
      header: 'Symbol',
      cell: i => <span className="font-mono font-bold text-blue-400 text-[11px]">{i.getValue()}</span>,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: i => <span className="text-slate-300 text-[11px] truncate max-w-[160px] block">{i.getValue()}</span>,
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: i => {
        const map: Record<string, string> = {
          ETF: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
          Stock: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
          Bond: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        };
        return <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${map[i.getValue()] ?? 'bg-slate-700 text-slate-300'}`}>{i.getValue()}</span>;
      },
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: i => <span className="font-mono text-slate-200 text-[11px]">{fmtPrice(i.getValue())}</span>,
    }),
    columnHelper.accessor('change1d', {
      header: '1D%',
      cell: i => { const v = i.getValue(); return <span className={`font-mono text-[11px] font-semibold ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pct(v, 2)}</span>; },
    }),
    columnHelper.accessor('return1y', {
      header: '1Y Ret',
      cell: i => { const v = i.getValue(); return <span className={`font-mono text-[11px] ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pct(v)}</span>; },
    }),
    columnHelper.accessor('return3y', {
      header: '3Y CAGR',
      cell: i => { const v = i.getValue(); return <span className={`font-mono text-[11px] ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pct(v)}</span>; },
    }),
    columnHelper.accessor('sharpe', {
      header: 'Sharpe',
      cell: i => <span className="font-mono text-[11px] text-slate-300">{i.getValue().toFixed(2)}</span>,
    }),
    columnHelper.accessor('volatility', {
      header: 'Vol%',
      cell: i => <span className="font-mono text-[11px] text-slate-400">{i.getValue().toFixed(1)}%</span>,
    }),
    columnHelper.accessor('expenseRatio', {
      header: 'Exp%',
      cell: i => { const v = i.getValue(); return <span className="font-mono text-[11px] text-slate-400">{v === 0 ? '—' : v.toFixed(2) + '%'}</span>; },
    }),
    columnHelper.accessor('aum', {
      header: 'AUM',
      cell: i => <span className="font-mono text-[11px] text-slate-400">{fmtAUM(i.getValue())}</span>,
    }),
    columnHelper.accessor('dividendYield', {
      header: 'Div%',
      cell: i => { const v = i.getValue(); return <span className={`font-mono text-[11px] ${v > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{v.toFixed(2)}%</span>; },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: i => {
        const sym = i.row.original.symbol;
        const inWL = hasSymbol(sym);
        return (
          <div className="flex gap-1">
            <button onClick={() => addSymbol(sym)} title="Add to Portfolio"
              className="p-1 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 transition-colors">
              <PlusCircle size={12} />
            </button>
            <button onClick={() => addSymbol(sym)} title="Watchlist"
              className={`p-1 rounded transition-colors ${inWL ? 'bg-amber-500/30 text-amber-300' : 'bg-[#1e2d45] text-slate-400 hover:text-amber-300'}`}>
              <Star size={12} fill={inWL ? 'currentColor' : 'none'} />
            </button>
            <a href={`/stocks/${sym}`} title="Analyze"
              className="p-1 rounded bg-[#1e2d45] text-slate-400 hover:text-slate-200 transition-colors">
              <ArrowRight size={12} />
            </a>
          </div>
        );
      },
    }),
  ], [addSymbol, hasSymbol]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const exportCSV = useCallback(() => {
    const hdr = ['Symbol','Name','Type','Price','1D%','1Y%','3Y%','Sharpe','Volatility','ExpRatio','AUM','DivYield'];
    const rows = filtered.map(a => [a.symbol, `"${a.name}"`, a.type, a.price, a.change1d, a.return1y, a.return3y, a.sharpe, a.volatility, a.expenseRatio, a.aum, a.dividendYield]);
    const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
    const el = document.createElement('a');
    el.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    el.download = 'yourdhan_screener.csv';
    el.click();
  }, [filtered]);

  function toggleType(t: string) {
    setPending(prev => { const f = cloneF(prev); f.types.has(t) ? f.types.delete(t) : f.types.add(t); return f; });
  }
  function toggleSector(s: string) {
    setPending(prev => { const f = cloneF(prev); f.sectors.has(s) ? f.sectors.delete(s) : f.sectors.add(s); return f; });
  }
  function upd<K extends keyof Filters>(key: K, val: Filters[K]) {
    setPending(prev => ({ ...cloneF(prev), [key]: val }));
  }
  function applyFilters() { setFilters(cloneF(pending)); table.setPageIndex(0); }
  function resetFilters() { const d = cloneF(DEFAULT_FILTERS); setPending(d); setFilters(d); }

  const sortIcon = (s: false | 'asc' | 'desc') => {
    if (s === 'asc') return <ChevronUp size={11} className="inline ml-0.5 text-blue-400" />;
    if (s === 'desc') return <ChevronDown size={11} className="inline ml-0.5 text-blue-400" />;
    return <ChevronsUpDown size={11} className="inline ml-0.5 opacity-20" />;
  };

  const ASSET_TYPES = [
    { label: 'Stocks', key: 'Stock' },
    { label: 'ETFs', key: 'ETF' },
    { label: 'Mutual Funds', key: 'Mutual Fund' },
    { label: 'Crypto', key: 'Crypto' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0b0f1a]">
      {/* LEFT PANEL */}
      <aside className="w-60 shrink-0 border-r border-[#1e2d45] bg-[#131929] p-4 overflow-y-auto sticky top-0 h-screen">
        <h2 className="text-xs font-bold text-slate-300 mb-4 tracking-widest uppercase">Screener Filters</h2>

        {/* Asset Type */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Asset Type</p>
          {ASSET_TYPES.map(({ label, key }) => (
            <label key={key} className="flex items-center gap-2 mb-1.5 cursor-pointer group">
              <input type="checkbox" checked={pending.types.has(key)} onChange={() => toggleType(key)}
                className="accent-blue-500 w-3.5 h-3.5 rounded" />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{label}</span>
            </label>
          ))}
        </div>

        <RangeSlider label="1Y Return" min={-50} max={100} value={pending.return1y} onChange={v => upd('return1y', v)} />
        <RangeSlider label="3Y Return" min={-30} max={50} value={pending.return3y} onChange={v => upd('return3y', v)} />
        <RangeSlider label="5Y Return" min={-20} max={30} value={pending.return5y} onChange={v => upd('return5y', v)} />
        <RangeSlider label="Volatility" min={0} max={60} value={pending.volatility} onChange={v => upd('volatility', v)} />
        <RangeSlider label="Sharpe Ratio" min={0} max={3} value={pending.sharpe} onChange={v => upd('sharpe', v)} suffix="" step={0.1} />
        <RangeSlider label="Expense Ratio" min={0} max={2} value={pending.expenseRatio} onChange={v => upd('expenseRatio', v)} step={0.05} />
        <RangeSlider label="Dividend Yield" min={0} max={10} value={pending.dividendYield} onChange={v => upd('dividendYield', v)} step={0.5} />

        <div className="mb-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">AUM Min ($B)</label>
          <input type="number" min={0} step={1} value={pending.aumMin}
            onChange={e => upd('aumMin', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded px-2 py-1 text-xs text-slate-200 font-mono
                       focus:outline-none focus:border-blue-500 transition-colors" />
        </div>

        <div className="mb-5">
          <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Sector</p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {allSectors.map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={pending.sectors.has(s)} onChange={() => toggleSector(s)}
                  className="accent-blue-500 w-3.5 h-3.5" />
                <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors truncate">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={applyFilters}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition-colors">
            Apply Filters
          </button>
          <button onClick={resetFilters}
            className="flex-1 bg-[#1e2d45] hover:bg-[#263d5a] text-slate-300 text-xs py-2 rounded transition-colors">
            Reset
          </button>
        </div>
      </aside>

      {/* RESULTS PANEL */}
      <main className="flex-1 p-5 overflow-hidden flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-100">Asset Screener</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing{' '}
              <span className="text-blue-400 font-mono font-semibold">{filtered.length}</span>
              {' '}of{' '}
              <span className="font-mono">{ASSET_UNIVERSE.length}</span> assets
            </p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131929] hover:bg-[#1e2d45] border border-[#1e2d45]
                       text-slate-300 text-xs rounded transition-colors">
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-lg border border-[#1e2d45] bg-[#0b0f1a]">
          <table className="w-full border-collapse" style={{ minWidth: 980 }}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="bg-[#131929] border-b border-[#1e2d45]">
                  {hg.headers.map(h => (
                    <th key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className={`px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider
                                  whitespace-nowrap select-none sticky top-0 bg-[#131929]
                                  ${h.column.getCanSort() ? 'cursor-pointer hover:text-slate-200' : ''}`}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && sortIcon(h.column.getIsSorted())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, idx) => (
                <tr key={row.id}
                  style={{ height: 40 }}
                  className={`border-b border-[#1e2d45]/40 hover:bg-[#1a2540] transition-colors cursor-default
                              ${idx % 2 === 1 ? 'bg-[#0d1320]' : 'bg-[#0b0f1a]'}`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center text-slate-500 text-sm">
                    No assets match the current filters. Try adjusting the sliders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rows per page:</span>
            <select value={table.getState().pagination.pageSize}
              onChange={e => { table.setPageSize(+e.target.value); table.setPageIndex(0); }}
              className="bg-[#131929] border border-[#1e2d45] rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500">
              {[25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Page <span className="text-slate-200 font-mono">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-mono">{table.getPageCount()}</span></span>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded bg-[#131929] border border-[#1e2d45] hover:border-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              ← Prev
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded bg-[#131929] border border-[#1e2d45] hover:border-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
