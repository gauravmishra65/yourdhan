import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Minus, XCircle } from 'lucide-react';
import { MOCK_STOCKS } from '../data/mockStocks';

// ── Guru list ─────────────────────────────────────────────────────────────────
interface GuruMeta {
  slug: string;
  name: string;
  aum: number;
  holdings: number;
  topHolding: string;
  performance1y: number;
}

const GURUS: GuruMeta[] = [
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

// ── Mock holdings ─────────────────────────────────────────────────────────────
interface Holding {
  ticker: string;
  name: string;
  shares: number;
  weight: number;
  avgCost: number;
  sector: string;
}

const MOCK_HOLDINGS: Holding[] = [
  { ticker: 'TITAN',       name: 'Titan Company',              shares: 240000, weight: 24.2, avgCost: 2840,  sector: 'Consumer'   },
  { ticker: 'TCS',         name: 'Tata Consultancy Services',  shares: 85000,  weight: 18.7, avgCost: 3200,  sector: 'IT'         },
  { ticker: 'HDFCBANK',    name: 'HDFC Bank',                  shares: 310000, weight: 14.5, avgCost: 1420,  sector: 'Financials' },
  { ticker: 'INFY',        name: 'Infosys',                    shares: 125000, weight: 10.8, avgCost: 1550,  sector: 'IT'         },
  { ticker: 'MARUTI',      name: 'Maruti Suzuki',              shares: 18000,  weight: 8.4,  avgCost: 9800,  sector: 'Auto'       },
  { ticker: 'ITC',         name: 'ITC Ltd',                    shares: 820000, weight: 7.2,  avgCost: 340,   sector: 'FMCG'      },
  { ticker: 'RELIANCE',    name: 'Reliance Industries',        shares: 45000,  weight: 6.0,  avgCost: 2200,  sector: 'Energy'     },
  { ticker: 'ICICIBANK',   name: 'ICICI Bank',                 shares: 190000, weight: 4.8,  avgCost: 980,   sector: 'Financials' },
  { ticker: 'SBIN',        name: 'State Bank of India',        shares: 210000, weight: 3.2,  avgCost: 580,   sector: 'Financials' },
  { ticker: 'SUNPHARMA',   name: 'Sun Pharma',                 shares: 58000,  weight: 2.2,  avgCost: 1180,  sector: 'Pharma'     },
];

// ── Latest moves ──────────────────────────────────────────────────────────────
type MoveType = 'NEW_BUY' | 'ADDED' | 'REDUCED' | 'SOLD_OUT';

interface Move {
  ticker: string;
  name: string;
  type: MoveType;
  shares: number;
  price: number;
  pctPortfolio: number;
}

const MOCK_MOVES: Move[] = [
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel',              type: 'NEW_BUY',  shares: 120000, price: 1620, pctPortfolio: 1.8 },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance',              type: 'NEW_BUY',  shares: 32000,  price: 7900, pctPortfolio: 2.3 },
  { ticker: 'HDFCBANK',   name: 'HDFC Bank',                  type: 'ADDED',    shares: 55000,  price: 1580, pctPortfolio: 14.5 },
  { ticker: 'TCS',        name: 'Tata Consultancy Services',  type: 'ADDED',    shares: 15000,  price: 3750, pctPortfolio: 18.7 },
  { ticker: 'WIPRO',      name: 'Wipro Ltd',                  type: 'REDUCED',  shares: -40000, price: 540,  pctPortfolio: 0.8 },
  { ticker: 'AXISBANK',   name: 'Axis Bank',                  type: 'REDUCED',  shares: -80000, price: 1150, pctPortfolio: 1.2 },
  { ticker: 'TATAMOTORS', name: 'Tata Motors',                type: 'SOLD_OUT', shares: -95000, price: 985,  pctPortfolio: 0 },
  { ticker: 'ADANIENT',   name: 'Adani Enterprises',          type: 'SOLD_OUT', shares: -22000, price: 3100, pctPortfolio: 0 },
];

const MOVE_CFG: Record<MoveType, { label: string; textColor: string; badgeCls: string; icon: React.ReactNode }> = {
  NEW_BUY:  { label: 'New Buys',  textColor: 'text-green-400', badgeCls: 'bg-green-500/10 text-green-400 border-green-500/20',  icon: <Plus  size={14} /> },
  ADDED:    { label: 'Added',     textColor: 'text-blue-400',  badgeCls: 'bg-blue-500/10  text-blue-400  border-blue-500/20',   icon: <TrendingUp size={14} /> },
  REDUCED:  { label: 'Reduced',   textColor: 'text-amber-400', badgeCls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Minus size={14} /> },
  SOLD_OUT: { label: 'Sold Out',  textColor: 'text-red-400',   badgeCls: 'bg-red-500/10   text-red-400   border-red-500/20',   icon: <XCircle size={14} /> },
};

type Tab = 'summary' | 'moves' | 'holdings';

// ─────────────────────────────────────────────────────────────────────────────
export default function GuruDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('summary');

  const guru = GURUS.find(g => g.slug === slug);

  if (!guru) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Guru not found.</p>
          <button onClick={() => navigate('/guru')} className="text-blue-400 hover:text-blue-300">
            ← Back to Gurus
          </button>
        </div>
      </div>
    );
  }

  const sectors = [...new Set(MOCK_HOLDINGS.map(h => h.sector))].slice(0, 3);
  const chartData = [...MOCK_HOLDINGS]
    .sort((a, b) => b.weight - a.weight)
    .map(h => ({ name: h.ticker, weight: h.weight }));

  const COLORS = ['#3b82f6','#6366f1','#8b5cf6','#a78bfa','#60a5fa','#34d399','#f59e0b','#f87171','#38bdf8','#818cf8'];

  return (
    <div className="min-h-screen bg-[#0b0f1a] p-4 md:p-6">
      {/* Back */}
      <button
        onClick={() => navigate('/guru')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4 text-sm"
      >
        <ArrowLeft size={16} /> Back to Gurus
      </button>

      {/* Hero */}
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-2xl flex-shrink-0">
              {guru.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{guru.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">Indian Value Investor · NSE Portfolio</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-lg font-semibold ${guru.performance1y >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {guru.performance1y >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {guru.performance1y >= 0 ? '+' : ''}{guru.performance1y}% (1Y)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0f1824] border border-[#1e2d45] rounded-lg p-1 mb-6 w-fit">
        {(['summary', 'moves', 'holdings'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'moves' ? 'Latest Moves' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Summary ── */}
      {tab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'AUM',          value: `₹${guru.aum.toLocaleString('en-IN')} Cr` },
              { label: '# Holdings',   value: String(guru.holdings) },
              { label: 'Top 3 Sectors',value: sectors.join(', ') },
              { label: 'Top Holding',  value: guru.topHolding },
            ].map(s => (
              <div key={s.label} className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-white font-semibold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#131929] border border-[#1e2d45] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Top 10 Holdings by Portfolio Weight</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} width={90} />
                <Tooltip
                  contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(v) => [`${v}%`, 'Weight']}
                />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Latest Moves ── */}
      {tab === 'moves' && (
        <div className="space-y-8">
          {(['NEW_BUY', 'ADDED', 'REDUCED', 'SOLD_OUT'] as MoveType[]).map(type => {
            const moves = MOCK_MOVES.filter(m => m.type === type);
            if (moves.length === 0) return null;
            const cfg = MOVE_CFG[type];
            return (
              <div key={type}>
                <h3 className={`flex items-center gap-2 font-semibold mb-3 ${cfg.textColor}`}>
                  {cfg.icon} {cfg.label}
                  <span className="bg-[#1e2d45] text-slate-300 text-xs rounded-full px-2 py-0.5 font-normal">
                    {moves.length}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {moves.map(m => (
                    <div
                      key={m.ticker}
                      className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4 flex items-center justify-between hover:border-blue-500/30 transition cursor-pointer"
                      onClick={() => navigate(`/stocks/${m.ticker}`)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-white font-semibold">{m.ticker}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${cfg.badgeCls}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs">{m.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-mono">
                          {Math.abs(m.shares).toLocaleString('en-IN')} shares
                        </p>
                        <p className="text-slate-400 text-xs">@ ₹{m.price.toLocaleString('en-IN')}</p>
                        <p className="text-slate-500 text-xs">
                          ₹{((Math.abs(m.shares) * m.price) / 1e7).toFixed(2)} Cr
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Holdings ── */}
      {tab === 'holdings' && (
        <div className="bg-[#131929] border border-[#1e2d45] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2d45] text-slate-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Ticker</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-right px-4 py-3">Shares</th>
                  <th className="text-right px-4 py-3">% Portfolio</th>
                  <th className="text-right px-4 py-3">Avg Cost</th>
                  <th className="text-right px-4 py-3">Current Price</th>
                  <th className="text-right px-4 py-3">Gain %</th>
                  <th className="text-left px-4 py-3">Sector</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HOLDINGS.map((h, i) => {
                  const stock = MOCK_STOCKS.find(s => s.ticker === h.ticker);
                  const currentPrice = stock?.currentPrice ?? h.avgCost * 1.15;
                  const gainPct = ((currentPrice - h.avgCost) / h.avgCost) * 100;
                  return (
                    <tr
                      key={h.ticker}
                      onClick={() => navigate(`/stocks/${h.ticker}`)}
                      className={`border-b border-[#1e2d45]/50 hover:bg-[#1a2540] cursor-pointer transition ${
                        i % 2 === 0 ? '' : 'bg-[#0f1824]/30'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-blue-400 font-semibold">{h.ticker}</td>
                      <td className="px-4 py-3.5 text-slate-200">{h.name}</td>
                      <td className="px-4 py-3.5 text-right text-slate-300 font-mono">
                        {h.shares.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-[#1e2d45] rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(h.weight * 4, 100)}%` }}
                            />
                          </div>
                          <span className="text-white font-mono text-xs w-10 text-right">{h.weight}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-300 font-mono">
                        ₹{h.avgCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-white font-mono">
                        ₹{currentPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-semibold ${gainPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-[#1e2d45] text-slate-300 rounded text-xs">
                          {h.sector}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
