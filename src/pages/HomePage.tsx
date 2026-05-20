import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Shield, Target, Briefcase, Shuffle, GitBranch,
  ArrowRight, BarChart2, Zap, Database, Lock, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { LAZY_PORTFOLIOS } from '../data/mockData'

// ─── Ticker data ─────────────────────────────────────────────────────────────
const TICKER_DATA = [
  { symbol: 'NIFTY 50',     value: '24,857.20', change: '+0.62%', up: true  },
  { symbol: 'SENSEX',       value: '81,921.45', change: '+0.58%', up: true  },
  { symbol: 'NIFTY BANK',   value: '53,412.80', change: '-0.21%', up: false },
  { symbol: 'NIFTY IT',     value: '39,284.10', change: '+1.14%', up: true  },
  { symbol: 'INDIA VIX',    value: '13.42',     change: '-4.82%', up: false },
  { symbol: 'NIFTY MID',    value: '47,628.35', change: '+0.89%', up: true  },
  { symbol: 'NIFTY NEXT50', value: '67,145.50', change: '+0.44%', up: true  },
  { symbol: 'NIFTY FMCG',   value: '55,382.00', change: '-0.33%', up: false },
]

// ─── Demo chart data ──────────────────────────────────────────────────────────
const DEMO_DATA = [
  { year: 2000, portfolio: 8500,  benchmark: 9100,  conservative: 9500  },
  { year: 2001, portfolio: 8800,  benchmark: 8500,  conservative: 9700  },
  { year: 2002, portfolio: 6800,  benchmark: 7200,  conservative: 8400  },
  { year: 2003, portfolio: 9500,  benchmark: 9000,  conservative: 10100 },
  { year: 2004, portfolio: 11100, benchmark: 10000, conservative: 11200 },
  { year: 2005, portfolio: 11700, benchmark: 10500, conservative: 12000 },
  { year: 2006, portfolio: 12800, benchmark: 11500, conservative: 13200 },
  { year: 2007, portfolio: 14000, benchmark: 12400, conservative: 14500 },
  { year: 2008, portfolio: 8200,  benchmark: 7600,  conservative: 8800  },
  { year: 2009, portfolio: 11200, benchmark: 9500,  conservative: 10800 },
  { year: 2010, portfolio: 13000, benchmark: 11000, conservative: 12400 },
  { year: 2011, portfolio: 13500, benchmark: 11200, conservative: 13000 },
  { year: 2012, portfolio: 15800, benchmark: 13000, conservative: 15200 },
  { year: 2013, portfolio: 18200, benchmark: 15500, conservative: 17200 },
  { year: 2014, portfolio: 21000, benchmark: 17600, conservative: 19800 },
  { year: 2015, portfolio: 22000, benchmark: 18300, conservative: 20800 },
  { year: 2016, portfolio: 25200, benchmark: 20500, conservative: 23600 },
  { year: 2017, portfolio: 31000, benchmark: 24000, conservative: 28500 },
  { year: 2018, portfolio: 30000, benchmark: 23000, conservative: 27400 },
  { year: 2019, portfolio: 39400, benchmark: 29200, conservative: 34500 },
  { year: 2020, portfolio: 46400, benchmark: 34200, conservative: 40600 },
  { year: 2021, portfolio: 59800, benchmark: 43500, conservative: 51800 },
  { year: 2022, portfolio: 49000, benchmark: 36000, conservative: 42500 },
  { year: 2023, portfolio: 61900, benchmark: 45500, conservative: 53800 },
  { year: 2024, portfolio: 76500, benchmark: 56200, conservative: 66000 },
]

// ─── Feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: TrendingUp, title: 'Portfolio Backtesting',
    desc: 'Test any allocation against 25 years of real market cycles — bull runs, crashes, and recoveries.',
    link: '/tools/portfolio-performance', color: '#3b82f6',
  },
  {
    icon: Shield, title: 'Risk Analysis',
    desc: 'Sharpe, Sortino, Max Drawdown, VaR, CVaR & 20+ more risk metrics visualised in one dashboard.',
    link: '/tools/risk-analysis', color: '#22c55e',
  },
  {
    icon: Target, title: 'Optimization',
    desc: 'Find the efficient frontier and maximum Sharpe allocation with gradient-descent portfolio optimizer.',
    link: '/tools/optimization', color: '#a855f7',
  },
  {
    icon: Briefcase, title: 'Lazy Portfolios',
    desc: '12 battle-tested strategies from Bogle, Dalio & Buffett — backtest them in one click.',
    link: '/lazy-portfolios', color: '#f59e0b',
  },
  {
    icon: Shuffle, title: 'Monte Carlo',
    desc: '1,000-path simulations to project future portfolio outcomes with confidence intervals.',
    link: '/tools/monte-carlo', color: '#ec4899',
  },
  {
    icon: GitBranch, title: 'Correlation Matrix',
    desc: 'Heatmap analysis to ensure true diversification and reduce hidden portfolio overlap.',
    link: '/tools/correlation', color: '#06b6d4',
  },
]

// ─── GF score stocks ──────────────────────────────────────────────────────────
const GF_STOCKS = [
  { ticker: 'TCS',       score: 91, price: '₹3,892', change: '+0.62%', up: true  },
  { ticker: 'HDFCBANK',  score: 87, price: '₹1,658', change: '+0.41%', up: true  },
  { ticker: 'TITAN',     score: 84, price: '₹3,245', change: '+1.20%', up: true  },
  { ticker: 'INFY',      score: 82, price: '₹1,845', change: '+0.84%', up: true  },
  { ticker: 'ITC',       score: 79, price: '₹462',   change: '-0.15%', up: false },
  { ticker: 'NESTLEIND', score: 77, price: '₹2,280', change: '+0.52%', up: true  },
  { ticker: 'BAJFINANCE',score: 76, price: '₹7,120', change: '+1.38%', up: true  },
  { ticker: 'WIPRO',     score: 74, price: '₹548',   change: '-0.28%', up: false },
  { ticker: 'ASIANPAINT',score: 73, price: '₹2,890', change: '+0.35%', up: true  },
  { ticker: 'CIPLA',     score: 72, price: '₹1,425', change: '+0.67%', up: true  },
]

// ─── News articles ────────────────────────────────────────────────────────────
const NEWS = [
  {
    title: 'RBI Holds Rates at 6.5% — Markets Rally on Dovish Tone',
    source: 'Economic Times', date: 'May 19, 2026',
    excerpt: 'The Reserve Bank of India maintained its benchmark repo rate, signalling a cautious approach amid moderating inflation and robust growth...',
  },
  {
    title: 'Nifty 50 Hits All-Time High; IT Stocks Lead the Charge',
    source: 'Mint', date: 'May 18, 2026',
    excerpt: 'Indian benchmark indices touched fresh lifetime highs Monday as foreign institutional investors turned net buyers for a fourth straight session...',
  },
  {
    title: "Buffett's 90/10 Portfolio Still Outperforms 60/40 Over 20 Years",
    source: 'YourDhan Research', date: 'May 17, 2026',
    excerpt: 'Our latest backtesting analysis shows the Buffett 90/10 portfolio delivered a 9.8% CAGR vs 8.4% for the classic 60/40 over two decades...',
  },
  {
    title: 'Gold Surges 2.8% as Dollar Weakens; GLD ETF Sees $1.2B Inflows',
    source: 'Bloomberg India', date: 'May 16, 2026',
    excerpt: 'Gold prices surged to their highest levels in three months as the US dollar weakened following softer-than-expected inflation data...',
  },
  {
    title: 'Sebi Proposes New Rules for Retail Derivative Trading',
    source: 'Business Standard', date: 'May 15, 2026',
    excerpt: 'The market regulator has proposed a minimum net-worth requirement of ₹5 lakh for retail participation in index options...',
  },
  {
    title: 'Passive Funds Cross ₹10 Lakh Crore AUM Milestone in India',
    source: 'Moneycontrol', date: 'May 14, 2026',
    excerpt: 'Index funds and ETFs in India have collectively crossed ₹10 lakh crore in assets under management — a landmark for passive investing...',
  },
]

// ─── Allocation colour palette ────────────────────────────────────────────────
const ALLOC_COLORS = [
  '#3b82f6','#22c55e','#f59e0b','#ec4899','#a855f7',
  '#06b6d4','#ef4444','#84cc16','#f97316','#8b5cf6',
]

// ─── Custom Recharts tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2235] border border-[#1e2d45] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-financial">
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [tickerPaused, setTickerPaused] = useState(false)
  const doubled = [...TICKER_DATA, ...TICKER_DATA]

  return (
    <div
      className="min-h-screen text-[#f1f5f9]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0b0f1a', margin: '-24px -20px' }}
    >
      {/* ── 1. Market Ticker Tape ────────────────────────────────────────────── */}
      <div
        className="w-full overflow-hidden select-none"
        style={{ background: '#0d1424', borderBottom: '1px solid #1e2d45', height: 36 }}
        onMouseEnter={() => setTickerPaused(true)}
        onMouseLeave={() => setTickerPaused(false)}
      >
        <div
          className="ticker-tape flex items-center whitespace-nowrap h-full"
          style={{ animationPlayState: tickerPaused ? 'paused' : 'running' }}
        >
          {doubled.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-6 h-full text-xs"
              style={{ borderRight: '1px solid #1e2d45' }}
            >
              <span style={{ color: '#64748b', fontWeight: 500 }}>{t.symbol}</span>
              <span className="font-financial">{t.value}</span>
              <span
                className="font-financial font-semibold"
                style={{ color: t.up ? '#22c55e' : '#ef4444' }}
              >
                {t.change}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── 2. Hero Section ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-20 md:py-28"
        style={{
          background: 'linear-gradient(135deg, #0b0f1a 0%, #0f172a 30%, #111827 60%, #0d1424 100%)',
        }}
      >
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 600, height: 600, opacity: 0.18,
              background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
              top: -200, left: -100,
              animation: 'pulse 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 400, height: 400, opacity: 0.1,
              background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
              top: 100, right: 0,
              animation: 'pulse 8s ease-in-out infinite reverse',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
          >
            <Zap size={12} />
            Free &nbsp;·&nbsp; No Signup &nbsp;·&nbsp; 25 Years of Data
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Smart Portfolio Analytics
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a5b4fc)' }}
            >
              for Every Investor
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#94a3b8' }}>
            Backtest strategies, analyze risk, optimize allocations — powered by 25+ years of market data.{' '}
            <span style={{ color: '#cbd5e1' }}>Free. No signup required.</span>
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/tools/portfolio-performance"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-sm text-white transition-all"
              style={{ background: '#2563eb', boxShadow: '0 0 24px rgba(59,130,246,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#3b82f6')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
            >
              Analyze Portfolio <ArrowRight size={16} />
            </Link>
            <Link
              to="/lazy-portfolios"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-sm transition-all"
              style={{ border: '1px solid #1e2d45', color: '#94a3b8', background: 'rgba(19,25,41,0.6)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.color = '#f1f5f9'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1e2d45'
                e.currentTarget.style.color = '#94a3b8'
              }}
            >
              Explore Lazy Portfolios <ChevronRight size={16} />
            </Link>
          </div>

          {/* Demo chart */}
          <div
            className="max-w-3xl mx-auto rounded-2xl p-4 md:p-6 shadow-2xl"
            style={{ background: 'rgba(19,25,41,0.85)', border: '1px solid #1e2d45', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-xs uppercase tracking-wide font-medium" style={{ color: '#475569' }}>
                ₹10,000 invested — Portfolio Growth (2000–2024)
              </span>
              <div className="flex items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 rounded" style={{ background: '#3b82f6' }} />
                  Portfolio
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 rounded" style={{ background: '#22c55e' }} />
                  Benchmark
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 rounded" style={{ background: '#f59e0b' }} />
                  Conservative
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={DEMO_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBench" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="portfolio"     name="Portfolio"     stroke="#3b82f6" fill="url(#gPort)"  strokeWidth={2}   dot={false} />
                <Area type="monotone" dataKey="benchmark"     name="Benchmark"     stroke="#22c55e" fill="url(#gBench)" strokeWidth={2}   dot={false} />
                <Area type="monotone" dataKey="conservative"  name="Conservative"  stroke="#f59e0b" fill="url(#gCons)"  strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── 3. Stats Bar ─────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #1e2d45', borderBottom: '1px solid #1e2d45', background: '#0d1424' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '20+',    label: 'Analytical Tools',  icon: BarChart2 },
            { num: '25 Yrs', label: 'Historical Data',   icon: Database },
            { num: '100+',   label: 'Portfolio Metrics', icon: TrendingUp },
            { num: 'Free',   label: 'No Signup Needed',  icon: Lock },
          ].map(({ num, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <Icon size={20} className="mb-1" style={{ color: '#3b82f6' }} />
              <span
                className="text-3xl font-bold font-financial"
                style={{ color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {num}
              </span>
              <span className="text-sm" style={{ color: '#64748b' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Market Overview Cards ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-white mb-6">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Buffett Indicator */}
          <div className="rounded-2xl p-6" style={{ background: '#131929', border: '1px solid #1e2d45' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>Buffett Indicator</span>
              <span
                className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}
              >
                Slightly Overvalued
              </span>
            </div>
            <div className="relative flex items-center justify-center mb-3" style={{ height: 100 }}>
              <svg viewBox="0 0 200 110" className="w-44">
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#1e2d45" strokeWidth="14" strokeLinecap="round" />
                <path
                  d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#f59e0b" strokeWidth="14"
                  strokeLinecap="round" strokeDasharray="251"
                  strokeDashoffset={251 * (1 - 172.9 / 250)}
                />
                <text x="16" y="118" fill="#475569" fontSize="9" textAnchor="middle">0%</text>
                <text x="184" y="118" fill="#475569" fontSize="9" textAnchor="middle">250%</text>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <span
                  className="text-3xl font-bold"
                  style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  172.9%
                </span>
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: '#475569' }}>Market Cap / GDP. Fair value ≈ 100–115%</p>
          </div>

          {/* Shiller CAPE */}
          <div className="rounded-2xl p-6" style={{ background: '#131929', border: '1px solid #1e2d45' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>Shiller CAPE Ratio</span>
              <span
                className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}
              >
                Elevated
              </span>
            </div>
            <div className="flex items-end gap-6 mb-5">
              <div>
                <p className="text-xs mb-1" style={{ color: '#475569' }}>Current</p>
                <p className="text-4xl font-bold" style={{ color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>24.8</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#475569' }}>Historical Mean</p>
                <p className="text-2xl font-bold" style={{ color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>19.2</p>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: '#1e2d45' }}>
              <div
                className="h-full rounded-full relative"
                style={{ background: 'linear-gradient(to right, #22c55e, #f59e0b, #ef4444)' }}
              >
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ left: `${(24.8 / 40) * 100}%`, background: '#fff', border: '2px solid #131929' }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: '#475569' }}>
              <span>Cheap</span><span>Fair</span><span>Expensive</span>
            </div>
            <p className="text-xs mt-3 text-center" style={{ color: '#475569' }}>29% above long-run historical mean</p>
          </div>

          {/* Market Breadth */}
          <div className="rounded-2xl p-6" style={{ background: '#131929', border: '1px solid #1e2d45' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>Market Breadth</span>
              <span
                className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
              >
                Bullish
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <p className="text-2xl font-bold font-financial" style={{ color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>312</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Advances</p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <p className="text-2xl font-bold font-financial" style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>188</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Declines</p>
              </div>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#1e2d45' }}>
              <div className="h-full rounded-full" style={{ width: `${(312 / 500) * 100}%`, background: '#22c55e' }} />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: '#475569' }}>
              A/D Ratio: 1.66 &nbsp;·&nbsp; 62.4% stocks advancing
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Feature Cards Grid ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Powerful Analytics Tools</h2>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Everything you need to make data-driven investment decisions
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, link, color }) => (
            <Link
              key={title}
              to={link}
              className="block rounded-2xl p-6 transition-all group"
              style={{ background: '#131929', border: '1px solid #1e2d45' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#2a3f5f'
                e.currentTarget.style.background = '#161f35'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1e2d45'
                e.currentTarget.style.background = '#131929'
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{desc}</p>
              <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{ color }}>
                Explore <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 6. Featured Lazy Portfolios ──────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #1e2d45', background: '#0d1424' }} className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Battle-Tested Lazy Portfolios</h2>
              <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                Proven strategies from investing legends — analyse with one click
              </p>
            </div>
            <Link
              to="/lazy-portfolios"
              className="text-sm flex items-center gap-1"
              style={{ color: '#3b82f6' }}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
            {LAZY_PORTFOLIOS.slice(0, 5).map(p => {
              const total = p.holdings.reduce((s, h) => s + h.weight, 0)
              return (
                <div
                  key={p.id}
                  className="rounded-2xl p-5 flex-none transition-all"
                  style={{ background: '#131929', border: '1px solid #1e2d45', width: 256 }}
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-white text-sm leading-tight">{p.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{p.author}</p>
                  </div>

                  {/* Allocation bar */}
                  <div className="flex rounded-full overflow-hidden mb-3" style={{ height: 8, gap: 1 }}>
                    {p.holdings.map((h, i) => (
                      <div
                        key={h.symbol}
                        style={{
                          width: `${(h.weight / total) * 100}%`,
                          background: ALLOC_COLORS[i % ALLOC_COLORS.length],
                        }}
                        title={`${h.symbol}: ${(h.weight * 100).toFixed(0)}%`}
                      />
                    ))}
                  </div>

                  {/* Holdings chips */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.holdings.slice(0, 4).map((h, i) => (
                      <span
                        key={h.symbol}
                        className="text-xs px-1.5 py-0.5 rounded font-financial"
                        style={{
                          background: `${ALLOC_COLORS[i % ALLOC_COLORS.length]}18`,
                          color: ALLOC_COLORS[i % ALLOC_COLORS.length],
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {h.symbol} {(h.weight * 100).toFixed(0)}%
                      </span>
                    ))}
                    {p.holdings.length > 4 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: '#1e2d45', color: '#64748b' }}
                      >
                        +{p.holdings.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-financial"
                      style={{
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        color: '#22c55e', fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      CAGR {p.cagr}%
                    </span>
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-financial"
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      DD {p.maxDrawdown}%
                    </span>
                  </div>

                  <Link
                    to="/lazy-portfolios"
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all"
                    style={{ color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
                      e.currentTarget.style.background = 'rgba(59,130,246,0.06)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Analyze <ArrowRight size={12} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 7. Top GF Score Stocks ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Top GF Score Stocks</h2>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Gurufocus-style composite quality ratings for Indian blue-chips
            </p>
          </div>
          <Link to="/screener" className="text-sm flex items-center gap-1" style={{ color: '#3b82f6' }}>
            Full Screener <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {GF_STOCKS.map(s => {
            const scoreColor = s.score >= 85 ? '#22c55e' : s.score >= 75 ? '#f59e0b' : '#ef4444'
            return (
              <div
                key={s.ticker}
                className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
                style={{ background: '#131929', border: '1px solid #1e2d45' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a3f5f')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e2d45')}
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {s.ticker}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${scoreColor}18`,
                    border: `1px solid ${scoreColor}30`,
                    color: scoreColor,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.score}
                </span>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>{s.price}</p>
                  <p className="text-xs" style={{ color: s.up ? '#22c55e' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.change}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 8. Tool Spotlight ────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #1e2d45', background: '#0d1424' }} className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, #131929 50%, rgba(99,102,241,0.04) 100%)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-4"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
              >
                <Zap size={10} /> Featured Tool
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Portfolio Performance Tool</h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>
                The most comprehensive portfolio backtesting tool for Indian investors. Build any allocation using 50+ assets, backtest across 25 years of market data, and get a full breakdown of risk-adjusted returns — Sharpe, Sortino, Max Drawdown, CAGR, rolling returns and more.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  '25 years of verified return data',
                  'Side-by-side benchmark comparison',
                  'Year-by-year return breakdown',
                  'Full risk metric dashboard',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#cbd5e1' }}>
                    <span
                      className="flex-none rounded-full"
                      style={{ width: 6, height: 6, background: '#3b82f6' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/tools/portfolio-performance"
                className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm text-white transition-all"
                style={{ background: '#2563eb', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#3b82f6')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
              >
                Try the Tool <ArrowRight size={14} />
              </Link>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(11,15,26,0.6)', border: '1px solid #1e2d45' }}
            >
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#475569' }}>
                Portfolio vs Benchmark
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={DEMO_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSpot1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSpot2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="portfolio" name="Portfolio" stroke="#3b82f6" fill="url(#gSpot1)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="benchmark" name="Benchmark" stroke="#22c55e" fill="url(#gSpot2)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Latest News ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Markets &amp; Insights</h2>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Latest news, analysis and research</p>
          </div>
          <Link to="/news" className="text-sm flex items-center gap-1" style={{ color: '#3b82f6' }}>
            All News <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {NEWS.map((article, i) => (
            <Link
              key={i}
              to="/news"
              className="block rounded-2xl p-5 transition-all"
              style={{ background: '#131929', border: '1px solid #1e2d45' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#2a3f5f'
                e.currentTarget.style.background = '#161f35'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1e2d45'
                e.currentTarget.style.background = '#131929'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium" style={{ color: '#3b82f6' }}>{article.source}</span>
                <span style={{ color: '#1e2d45' }}>·</span>
                <span className="text-xs" style={{ color: '#475569' }}>{article.date}</span>
              </div>
              <h3 className="font-semibold text-white text-sm leading-snug mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#64748b' }}>{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 10. Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #1e2d45', background: '#080c16' }} className="pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#2563eb' }}
                >
                  <TrendingUp size={16} className="text-white" />
                </div>
                <span className="font-bold text-xl text-white">YourDhan</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#64748b' }}>
                Professional-grade portfolio analytics for every Indian investor. Free, open, and powered by 25 years of market data.
              </p>
            </div>

            {[
              {
                heading: 'Tools',
                links: [
                  { label: 'Portfolio Performance', href: '/tools/portfolio-performance' },
                  { label: 'Risk Analysis',          href: '/tools/risk-analysis' },
                  { label: 'Optimization',           href: '/tools/optimization' },
                  { label: 'Monte Carlo',            href: '/tools/monte-carlo' },
                  { label: 'Correlation',            href: '/tools/correlation' },
                ],
              },
              {
                heading: 'Portfolios',
                links: [
                  { label: 'Lazy Portfolios', href: '/lazy-portfolios' },
                  { label: 'Three-Fund',      href: '/lazy-portfolios' },
                  { label: 'All Weather',     href: '/lazy-portfolios' },
                  { label: 'Permanent',       href: '/lazy-portfolios' },
                ],
              },
              {
                heading: 'Company',
                links: [
                  { label: 'About Us', href: '/about'   },
                  { label: 'Pricing',  href: '/pricing' },
                  { label: 'News',     href: '/news'    },
                  { label: 'Screener', href: '/screener'},
                ],
              },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="font-semibold text-sm text-white mb-3">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link
                        to={l.href}
                        className="text-sm transition-colors"
                        style={{ color: '#64748b' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6"
            style={{ borderTop: '1px solid #1e2d45' }}
          >
            <p className="text-sm" style={{ color: '#475569' }}>
              © 2025 YourDhan. For educational purposes only. Not investment advice.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Contact'].map(t => (
                <Link
                  key={t}
                  to="/about"
                  className="text-xs transition-colors"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
