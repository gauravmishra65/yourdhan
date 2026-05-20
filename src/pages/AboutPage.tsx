import { Link } from 'react-router-dom'
import { TrendingUp, Shield, Zap, BarChart2, Globe, BookOpen, Code2, ExternalLink } from 'lucide-react'

const FEATURES = [
  {
    Icon: BarChart2,
    title: 'Portfolio Analytics',
    desc: 'Full backtest engine with CAGR, Sharpe, Sortino, VaR, CVaR, Calmar, and 30+ performance metrics across any time window.',
  },
  {
    Icon: TrendingUp,
    title: 'GF Score Engine',
    desc: 'Proprietary scoring combining Piotroski F-Score, Altman Z-Score, Beneish M-Score, DCF valuation, and momentum signals.',
  },
  {
    Icon: Shield,
    title: 'Risk Analysis',
    desc: 'Monte Carlo simulations, efficient frontier optimisation, drawdown analysis, rolling returns and factor exposure analysis.',
  },
  {
    Icon: Zap,
    title: 'Real-time Screener',
    desc: 'Filter 20+ NSE stocks by valuation, profitability, financial health, growth and momentum parameters with multi-column sorting.',
  },
  {
    Icon: Globe,
    title: 'Market Intelligence',
    desc: 'Track Indian and global indices, 20 macro indicators, 50 news articles, and economic calendar — all in one place.',
  },
  {
    Icon: BookOpen,
    title: 'Financial Education',
    desc: 'Every metric comes with a formula tooltip, interpretation guide, and context to help you understand what the numbers mean.',
  },
]

const TECH_STACK = [
  { name: 'React 18 + TypeScript', desc: 'Type-safe, component-based UI' },
  { name: 'Vite + Tailwind CSS', desc: 'Fast bundling, utility-first styling' },
  { name: 'Recharts', desc: 'All interactive charts and visualisations' },
  { name: 'Zustand + localStorage', desc: 'Persistent portfolio state management' },
  { name: 'TanStack Table v8', desc: 'Sortable, filterable data tables' },
  { name: 'Supabase', desc: 'Backend-ready for future features' },
]

const PHILOSOPHY = [
  {
    q: 'Why no login / authentication?',
    a: 'YourDhan is designed to be zero-friction. Your portfolio data lives in your browser\'s localStorage. No account, no password, no server costs. Just open and analyse.',
  },
  {
    q: 'Is this real financial data?',
    a: 'All data is mock/illustrative — generated deterministically for demonstration purposes. The formulas and models are mathematically accurate but the underlying prices are not real-time. Please do not make investment decisions based on this data.',
  },
  {
    q: 'What is GF Score?',
    a: 'GF Score is our composite quality-value signal inspired by GuruFocus. It combines Piotroski (financial strength), Altman Z (bankruptcy risk), Beneish M (earnings quality), DCF margin of safety, and price momentum into a single 0–10 score.',
  },
  {
    q: 'Will you add real market data?',
    a: 'Yes — the Supabase backend is already wired up. Future versions will integrate NSE/BSE data feeds, real-time prices, and server-side alert delivery.',
  },
]

export default function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <span className="text-4xl font-bold text-slate-100">YourDhan</span>
        </div>
        <p className="text-xl text-slate-300 font-medium">Smart Portfolio Analytics for Long-Term Investors</p>
        <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
          YourDhan brings institutional-grade portfolio analysis tools to individual investors —
          completely free, no login required, all computations done locally in your browser.
          Built for the Indian market with INR formatting, NSE stocks, and 6% risk-free rate defaults.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/tools/portfolio-performance" className="btn-primary flex items-center gap-2">
            <BarChart2 size={16} /> Start Analysing
          </Link>
          <a href="https://github.com/gauravmishra65/yourdhan" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#131929] border border-[#1e2d45] text-slate-300 hover:border-blue-500 transition-colors text-sm">
            <Code2 size={16} /> View on GitHub
          </a>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">What's Inside</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-5 space-y-3">
              <div className="w-10 h-10 bg-blue-900/40 rounded-lg flex items-center justify-center">
                <f.Icon size={20} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-100">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* By the numbers */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-6 text-center">By the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '65+', label: 'Financial Formulas', color: 'text-blue-400' },
            { val: '20', label: 'NSE Stocks', color: 'text-green-400' },
            { val: '25yr', label: 'Historical Data', color: 'text-purple-400' },
            { val: '30+', label: 'Portfolio Metrics', color: 'text-amber-400' },
            { val: '1000', label: 'Monte Carlo Sims', color: 'text-teal-400' },
            { val: '7 tabs', label: 'Stock Deep-Dive', color: 'text-blue-400' },
            { val: '50', label: 'News Articles', color: 'text-green-400' },
            { val: '0', label: 'Login Required', color: 'text-red-400' },
          ].map(s => (
            <div key={s.label}>
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy / FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Philosophy & FAQ</h2>
        <div className="space-y-4">
          {PHILOSOPHY.map(item => (
            <div key={item.q} className="card p-5">
              <h3 className="font-semibold text-slate-200 mb-2">{item.q}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Built With</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TECH_STACK.map(t => (
            <div key={t.name} className="card p-4">
              <div className="font-medium text-slate-200 text-sm">{t.name}</div>
              <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl p-6">
        <h3 className="font-semibold text-amber-400 mb-2">⚠ Important Disclaimer</h3>
        <p className="text-sm text-amber-200/60 leading-relaxed">
          YourDhan is an educational and demonstration platform. All data — including stock prices, financial statements,
          news articles, and macro indicators — is mock/illustrative data generated for demonstration purposes only.
          <strong className="text-amber-300"> This is not investment advice.</strong> Do not make investment decisions
          based on information shown in this application. Always consult a SEBI-registered investment advisor before
          investing. Past performance does not guarantee future returns. Investments in securities are subject to market risk.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pb-4">
        <p className="text-slate-500 text-sm mb-4">Made with ♥ for Indian investors · Open source · MIT License</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/screener" className="px-4 py-2 rounded bg-[#131929] border border-[#1e2d45] text-slate-300 hover:border-blue-500 transition-colors text-sm">
            Try the Screener
          </Link>
        </div>
      </div>
    </div>
  )
}
