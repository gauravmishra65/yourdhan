import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Users, DollarSign, ChevronRight, Search } from 'lucide-react';

interface Guru {
  slug: string;
  name: string;
  aum: number;
  holdings: number;
  topHolding: string;
  performance1y: number;
}

const GURUS: Guru[] = [
  { slug: 'rakesh-jhunjhunwala', name: 'Rakesh Jhunjhunwala (Legacy)', aum: 35000, holdings: 18, topHolding: 'TITAN', performance1y: 28.4 },
  { slug: 'vijay-kedia', name: 'Vijay Kedia', aum: 8200, holdings: 12, topHolding: 'ELECON', performance1y: 41.2 },
  { slug: 'porinju-veliyath', name: 'Porinju Veliyath', aum: 4500, holdings: 24, topHolding: 'MUTHOOTFIN', performance1y: 18.7 },
  { slug: 'dolly-khanna', name: 'Dolly Khanna', aum: 3800, holdings: 31, topHolding: 'RAIN', performance1y: 22.1 },
  { slug: 'ashish-kacholia', name: 'Ashish Kacholia', aum: 6100, holdings: 19, topHolding: 'NAZARA', performance1y: 35.8 },
  { slug: 'radhakishan-damani', name: 'Radhakishan Damani', aum: 112000, holdings: 8, topHolding: 'DMART', performance1y: 15.2 },
  { slug: 'nikhil-vora', name: 'Nikhil Vora', aum: 2800, holdings: 22, topHolding: 'NYKAA', performance1y: -8.4 },
  { slug: 'sunil-singhania', name: 'Sunil Singhania', aum: 9200, holdings: 35, topHolding: 'HDFCBANK', performance1y: 24.6 },
  { slug: 'raamdeo-agrawal', name: 'Raamdeo Agrawal', aum: 18500, holdings: 15, topHolding: 'HEROMOTOCO', performance1y: 31.2 },
  { slug: 'mohnish-pabrai', name: 'Mohnish Pabrai', aum: 7400, holdings: 10, topHolding: 'SUNTV', performance1y: 19.8 },
];

export default function GuruPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Guru>('aum');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = GURUS
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? bv - av : av - bv;
      }
      return sortDir === 'desc'
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });

  function toggleSort(key: keyof Guru) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortIndicator({ k }: { k: keyof Guru }) {
    if (sortKey !== k) return <span className="text-slate-600 ml-1">↕</span>;
    return <span className="text-blue-400 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  }

  const totalAUM = GURUS.reduce((s, g) => s + g.aum, 0);
  const avgPerf = GURUS.reduce((s, g) => s + g.performance1y, 0) / GURUS.length;
  const bullish = GURUS.filter(g => g.performance1y > 0).length;

  return (
    <div className="min-h-screen bg-[#0b0f1a] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Guru Portfolios</h1>
        <p className="text-slate-400 text-sm">Track investments of India's most successful investors</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-400" />
            <span className="text-slate-400 text-xs uppercase tracking-wide">Gurus Tracked</span>
          </div>
          <div className="text-2xl font-bold text-white">{GURUS.length}</div>
        </div>
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-green-400" />
            <span className="text-slate-400 text-xs uppercase tracking-wide">Combined AUM</span>
          </div>
          <div className="text-2xl font-bold text-white">₹{(totalAUM / 1000).toFixed(0)}K Cr</div>
        </div>
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-amber-400" />
            <span className="text-slate-400 text-xs uppercase tracking-wide">Avg 1Y Return</span>
          </div>
          <div className={`text-2xl font-bold ${avgPerf >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {avgPerf >= 0 ? '+' : ''}{avgPerf.toFixed(1)}%
          </div>
        </div>
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-slate-400 text-xs uppercase tracking-wide">Bullish Count</span>
          </div>
          <div className="text-2xl font-bold text-white">{bullish}/{GURUS.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search guru..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm bg-[#131929] border border-[#1e2d45] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2d45] text-slate-400 text-xs uppercase tracking-wide">
                <th
                  className="text-left px-4 py-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort('name')}
                >
                  Name <SortIndicator k="name" />
                </th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort('aum')}
                >
                  AUM (₹ Cr) <SortIndicator k="aum" />
                </th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort('holdings')}
                >
                  # Holdings <SortIndicator k="holdings" />
                </th>
                <th className="text-left px-4 py-3">Top Holding</th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort('performance1y')}
                >
                  Performance 1Y <SortIndicator k="performance1y" />
                </th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guru, i) => (
                <tr
                  key={guru.slug}
                  className={`border-b border-[#1e2d45]/50 hover:bg-[#1a2540] cursor-pointer transition ${
                    i % 2 === 0 ? '' : 'bg-[#0f1824]/30'
                  }`}
                  onClick={() => navigate(`/guru/${guru.slug}`)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                        {guru.name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{guru.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right text-white font-mono">
                    ₹{guru.aum.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{guru.holdings}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-mono">
                      {guru.topHolding}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`flex items-center justify-end gap-1 font-semibold ${
                      guru.performance1y >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {guru.performance1y >= 0
                        ? <TrendingUp size={14} />
                        : <TrendingDown size={14} />}
                      {guru.performance1y >= 0 ? '+' : ''}{guru.performance1y}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                      onClick={e => { e.stopPropagation(); navigate(`/guru/${guru.slug}`); }}
                    >
                      View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">No gurus match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
