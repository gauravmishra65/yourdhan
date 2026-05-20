import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight, Users, Building2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface InsiderTx {
  date: string;
  company: string;
  ticker: string;
  insider: string;
  role: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  value: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const INSIDER_TRANSACTIONS: InsiderTx[] = [
  { date: '2025-05-15', company: 'TCS',            ticker: 'TCS',        insider: 'N Chandrasekaran',   role: 'Chairman',        type: 'BUY',  shares: 50000,  price: 3892,  value: 194600000  },
  { date: '2025-05-12', company: 'Infosys',         ticker: 'INFY',       insider: 'Salil Parekh',       role: 'CEO',             type: 'BUY',  shares: 25000,  price: 1845,  value: 46125000   },
  { date: '2025-05-10', company: 'HDFC Bank',       ticker: 'HDFCBANK',   insider: 'Sashidhar Jagdishan',role: 'MD & CEO',        type: 'BUY',  shares: 80000,  price: 1623,  value: 129840000  },
  { date: '2025-05-08', company: 'Reliance',        ticker: 'RELIANCE',   insider: 'Mukesh Ambani',      role: 'Chairman',        type: 'BUY',  shares: 100000, price: 2847,  value: 284700000  },
  { date: '2025-05-07', company: 'ICICI Bank',      ticker: 'ICICIBANK',  insider: 'Sandeep Bakhshi',    role: 'MD & CEO',        type: 'BUY',  shares: 45000,  price: 1285,  value: 57825000   },
  { date: '2025-05-06', company: 'Wipro',           ticker: 'WIPRO',      insider: 'Rishad Premji',      role: 'Chairman',        type: 'SELL', shares: 200000, price: 558,   value: 111600000  },
  { date: '2025-05-05', company: 'Titan Company',   ticker: 'TITAN',      insider: 'C K Venkataraman',   role: 'MD',              type: 'BUY',  shares: 30000,  price: 3640,  value: 109200000  },
  { date: '2025-05-03', company: 'ITC Ltd',         ticker: 'ITC',        insider: 'Sanjiv Puri',        role: 'Chairman',        type: 'BUY',  shares: 150000, price: 472,   value: 70800000   },
  { date: '2025-05-02', company: 'HCL Technologies',ticker: 'HCLTECH',    insider: 'Roshni Nadar Malhotra',role: 'Chairperson',   type: 'BUY',  shares: 60000,  price: 1825,  value: 109500000  },
  { date: '2025-04-30', company: 'Bajaj Finance',   ticker: 'BAJFINANCE', insider: 'Rajeev Jain',        role: 'MD & CEO',        type: 'BUY',  shares: 12000,  price: 8245,  value: 98940000   },
  { date: '2025-04-28', company: 'Adani Enterprises',ticker: 'ADANIENT',  insider: 'Gautam Adani',       role: 'Chairman',        type: 'BUY',  shares: 200000, price: 3185,  value: 637000000  },
  { date: '2025-04-25', company: 'Maruti Suzuki',   ticker: 'MARUTI',     insider: 'Hisashi Takeuchi',   role: 'MD & CEO',        type: 'SELL', shares: 5000,   price: 12450, value: 62250000   },
  { date: '2025-04-22', company: 'Sun Pharma',      ticker: 'SUNPHARMA',  insider: 'Dilip Shanghvi',     role: 'MD',              type: 'BUY',  shares: 70000,  price: 1642,  value: 114940000  },
  { date: '2025-04-20', company: 'Axis Bank',       ticker: 'AXISBANK',   insider: 'Amitabh Chaudhry',   role: 'MD & CEO',        type: 'BUY',  shares: 55000,  price: 1195,  value: 65725000   },
  { date: '2025-04-18', company: 'Bharti Airtel',   ticker: 'BHARTIARTL', insider: 'Sunil Mittal',       role: 'Chairman',        type: 'BUY',  shares: 120000, price: 1695,  value: 203400000  },
  { date: '2025-04-15', company: 'Tata Motors',     ticker: 'TATAMOTORS', insider: 'N Chandrasekaran',   role: 'Chairman',        type: 'SELL', shares: 90000,  price: 1025,  value: 92250000   },
  { date: '2025-04-12', company: 'SBI',             ticker: 'SBIN',       insider: 'Dinesh Kumar Khara', role: 'Chairman',        type: 'BUY',  shares: 80000,  price: 845,   value: 67600000   },
  { date: '2025-04-10', company: 'Nestle India',    ticker: 'NESTLEIND',  insider: 'Suresh Narayanan',   role: 'CMD',             type: 'SELL', shares: 1200,   price: 24850, value: 29820000   },
  { date: '2025-04-08', company: 'HUL',             ticker: 'HINDUNILVR', insider: 'Rohit Jawa',         role: 'CEO & MD',        type: 'BUY',  shares: 35000,  price: 2385,  value: 83475000   },
  { date: '2025-04-05', company: 'Larsen & Toubro', ticker: 'LT',         insider: 'S N Subrahmanyan',   role: 'MD & CEO',        type: 'BUY',  shares: 28000,  price: 3624,  value: 101472000  },
  { date: '2025-04-02', company: 'TCS',             ticker: 'TCS',        insider: 'K Krithivasan',      role: 'CEO & MD',        type: 'BUY',  shares: 18000,  price: 3820,  value: 68760000   },
  { date: '2025-03-28', company: 'Infosys',         ticker: 'INFY',       insider: 'Nandan Nilekani',    role: 'Chairman',        type: 'SELL', shares: 300000, price: 1780,  value: 534000000  },
  { date: '2025-03-25', company: 'Titan Company',   ticker: 'TITAN',      insider: 'Bhaskar Bhat',       role: 'Director',        type: 'BUY',  shares: 12000,  price: 3520,  value: 42240000   },
  { date: '2025-03-22', company: 'ICICI Bank',      ticker: 'ICICIBANK',  insider: 'Girish Chandra Chaturvedi', role: 'Non-Exec Chair', type: 'BUY', shares: 22000, price: 1260, value: 27720000 },
  { date: '2025-03-20', company: 'HCL Technologies',ticker: 'HCLTECH',    insider: 'C Vijayakumar',      role: 'CEO & MD',        type: 'BUY',  shares: 40000,  price: 1798,  value: 71920000   },
];

// ── Double buys highlight ─────────────────────────────────────────────────────
const DOUBLE_BUYS = [
  { ticker: 'TITAN',   name: 'Titan Company',    insiders: 3, institutions: 5, change: '+4.2%' },
  { ticker: 'HCLTECH', name: 'HCL Technologies', insiders: 2, institutions: 7, change: '+2.8%' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatValue(v: number): string {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  return `₹${(v / 1e5).toFixed(2)} L`;
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

const PAGE_SIZE = 8;

// ─────────────────────────────────────────────────────────────────────────────
export default function InsiderPage() {
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [periodFilter, setPeriodFilter] = useState<'30D' | '90D' | '1Y'>('90D');
  const [page, setPage] = useState(0);

  const periodDays = { '30D': 30, '90D': 90, '1Y': 365 }[periodFilter];

  const filtered = useMemo(() => {
    return INSIDER_TRANSACTIONS.filter(tx => {
      const matchType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchPeriod = daysAgo(tx.date) <= periodDays;
      return matchType && matchPeriod;
    });
  }, [typeFilter, periodDays]);

  const buys  = filtered.filter(t => t.type === 'BUY');
  const sells = filtered.filter(t => t.type === 'SELL');
  const ratio = sells.length === 0 ? buys.length : (buys.length / sells.length);
  const netBuying = buys.reduce((s, t) => s + t.value, 0) - sells.reduce((s, t) => s + t.value, 0);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#0b0f1a] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Insider Activity</h1>
        <p className="text-slate-400 text-sm">Track promoter and institutional buying/selling patterns</p>
      </div>

      {/* Summary header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(['30D', '90D', '1Y'] as const).map(period => {
          const pDays = { '30D': 30, '90D': 90, '1Y': 365 }[period];
          const pTxs = INSIDER_TRANSACTIONS.filter(t => daysAgo(t.date) <= pDays);
          const pBuys = pTxs.filter(t => t.type === 'BUY').length;
          const pSells = pTxs.filter(t => t.type === 'SELL').length;
          const pRatio = pSells === 0 ? pBuys : (pBuys / pSells);
          const sentiment = pRatio >= 3 ? 'Very Bullish' : pRatio >= 1.5 ? 'Bullish' : pRatio >= 1 ? 'Neutral' : 'Bearish';
          const sentColor = pRatio >= 1.5 ? 'text-green-400' : pRatio >= 1 ? 'text-amber-400' : 'text-red-400';
          return (
            <div key={period} className="bg-[#131929] border border-[#1e2d45] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs uppercase tracking-wide">{period} Buy/Sell Ratio</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  pRatio >= 1.5 ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : pRatio >= 1 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>{sentiment}</span>
              </div>
              <div className="text-xl font-bold text-white">
                {pRatio.toFixed(1)} Buys : 1 Sell
              </div>
              <div className="text-slate-400 text-xs mt-1">{pBuys} buys · {pSells} sells</div>
            </div>
          );
        })}
      </div>

      {/* Net buying banner */}
      <div className={`flex items-center gap-3 rounded-xl p-4 mb-6 border ${
        netBuying >= 0
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}>
        {netBuying >= 0
          ? <TrendingUp className="text-green-400 flex-shrink-0" size={20} />
          : <TrendingDown className="text-red-400 flex-shrink-0" size={20} />}
        <div>
          <span className={`font-semibold ${netBuying >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Net Insider {netBuying >= 0 ? 'Buying' : 'Selling'}:&nbsp;
            {netBuying >= 0 ? '+' : ''}{formatValue(Math.abs(netBuying))}
          </span>
          <span className="text-slate-400 text-sm ml-2">last 90 days</span>
        </div>
      </div>

      {/* Double Buys */}
      <div className="mb-6">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Users size={16} className="text-amber-400" />
          Double Buys
          <span className="text-slate-400 text-xs font-normal">Companies where both insiders AND institutions bought</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOUBLE_BUYS.map(d => (
            <div key={d.ticker} className="bg-[#131929] border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-mono text-white font-bold text-lg">{d.ticker}</span>
                  <span className="text-slate-400 text-sm ml-2">{d.name}</span>
                </div>
                <span className="text-green-400 font-semibold">{d.change}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                  <Users size={14} className="text-blue-400" />
                  <div>
                    <p className="text-blue-400 font-bold text-lg leading-none">{d.insiders}</p>
                    <p className="text-slate-400 text-xs">Insiders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <Building2 size={14} className="text-green-400" />
                  <div>
                    <p className="text-green-400 font-bold text-lg leading-none">{d.institutions}</p>
                    <p className="text-slate-400 text-xs">Institutions</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-[#0f1824] border border-[#1e2d45] rounded-lg p-1">
          {(['ALL', 'BUY', 'SELL'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setTypeFilter(f); setPage(0); }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                typeFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[#0f1824] border border-[#1e2d45] rounded-lg p-1">
          {(['30D', '90D', '1Y'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setPeriodFilter(f); setPage(0); }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                periodFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-slate-500 text-xs ml-auto">{filtered.length} transactions</span>
      </div>

      {/* Table */}
      <div className="bg-[#131929] border border-[#1e2d45] rounded-xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2d45] text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Insider</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-center px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Shares</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((tx, i) => (
                <tr
                  key={i}
                  className={`border-b border-[#1e2d45]/50 hover:bg-[#1a2540] transition ${
                    i % 2 === 0 ? '' : 'bg-[#0f1824]/30'
                  }`}
                >
                  <td className="px-4 py-3 text-slate-400 text-xs">{tx.date}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white font-medium">{tx.company}</span>
                      <span className="ml-2 text-xs font-mono text-blue-400">{tx.ticker}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{tx.insider}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{tx.role}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      tx.type === 'BUY'
                        ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                        : 'bg-red-500/15 text-red-400 border border-red-500/25'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">
                    {tx.shares.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">
                    ₹{tx.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono text-sm ${tx.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatValue(tx.value)}
                    </span>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">No transactions match filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            Page {page + 1} of {totalPages} · {filtered.length} results
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded bg-[#131929] border border-[#1e2d45] text-slate-400 hover:text-white disabled:opacity-30 transition"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(0, Math.min(page - 2 + i, totalPages - 1));
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded text-xs font-medium transition ${
                    pg === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#131929] border border-[#1e2d45] text-slate-400 hover:text-white'
                  }`}
                >
                  {pg + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded bg-[#131929] border border-[#1e2d45] text-slate-400 hover:text-white disabled:opacity-30 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
