import { Link } from 'react-router-dom'
import { Check, X, Zap, Shield, Star, TrendingUp } from 'lucide-react'

const PLANS = [
  {
    name: 'Free Forever',
    price: '₹0',
    period: 'forever',
    desc: 'Everything you need for personal portfolio analysis',
    highlight: false,
    cta: 'Start Now',
    ctaTo: '/tools/portfolio-performance',
    color: 'border-[#1e2d45]',
    Icon: TrendingUp,
    features: [
      { text: 'Full portfolio backtesting engine', yes: true },
      { text: '30+ performance & risk metrics', yes: true },
      { text: 'DCF intrinsic value calculator', yes: true },
      { text: 'Stock screener (20 NSE stocks)', yes: true },
      { text: 'GF Score analysis', yes: true },
      { text: 'Efficient frontier optimiser', yes: true },
      { text: 'Monte Carlo simulation', yes: true },
      { text: 'Market overview & macro data', yes: true },
      { text: 'Financial calendar', yes: true },
      { text: 'Price alerts (browser-based)', yes: true },
      { text: 'Guru portfolio tracker', yes: true },
      { text: 'Real-time NSE data feed', yes: false },
      { text: 'Portfolio sync across devices', yes: false },
      { text: 'Email / push alert delivery', yes: false },
      { text: 'Advanced screener (2,000+ stocks)', yes: false },
    ],
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    desc: 'Real data, real-time alerts, and advanced screening',
    highlight: true,
    cta: 'Coming Soon',
    ctaTo: '/about',
    color: 'border-blue-500',
    Icon: Zap,
    features: [
      { text: 'Everything in Free', yes: true },
      { text: 'Real-time NSE / BSE data feed', yes: true },
      { text: 'Portfolio sync across devices', yes: true },
      { text: 'Email & push alert delivery', yes: true },
      { text: 'Advanced screener (2,000+ stocks)', yes: true },
      { text: 'Quarterly results tracker', yes: true },
      { text: 'Insider trading tracker (real)', yes: true },
      { text: 'Custom watchlist alerts', yes: true },
      { text: 'Export to Excel / PDF', yes: true },
      { text: 'API access for personal use', yes: true },
      { text: 'Priority support', yes: true },
      { text: 'Custom portfolio benchmarks', yes: true },
      { text: 'Option chain analytics', yes: false },
      { text: 'Family portfolio consolidation', yes: false },
      { text: 'Advisor client management', yes: false },
    ],
  },
  {
    name: 'Advisor',
    price: '₹2,999',
    period: '/month',
    desc: 'Multi-client management for SEBI RIAs and MFDs',
    highlight: false,
    cta: 'Contact Us',
    ctaTo: '/about',
    color: 'border-purple-500/50',
    Icon: Shield,
    features: [
      { text: 'Everything in Pro', yes: true },
      { text: 'Multi-client portfolio management', yes: true },
      { text: 'Client reporting & presentations', yes: true },
      { text: 'Option chain analytics', yes: true },
      { text: 'Family portfolio consolidation', yes: true },
      { text: 'Advisor client management', yes: true },
      { text: 'White-label reports with your branding', yes: true },
      { text: 'Bulk stock analysis', yes: true },
      { text: 'Dedicated account manager', yes: true },
      { text: 'SEBI compliance toolkit', yes: true },
      { text: 'Custom data integrations', yes: true },
      { text: 'SLA-backed uptime guarantee', yes: true },
      { text: 'Training & onboarding', yes: true },
      { text: 'Custom feature development', yes: false },
      { text: 'On-premise deployment', yes: false },
    ],
  },
]

const FAQ = [
  {
    q: 'Is the Free plan really free forever?',
    a: 'Yes. YourDhan\'s core analytics — portfolio backtesting, DCF, screener, GF Score, Monte Carlo, and all visualisations — will always be free. No credit card required.',
  },
  {
    q: 'When will Pro launch?',
    a: 'We\'re building real-time NSE data integration and cross-device sync. Subscribe to our newsletter to be notified when Pro launches — early subscribers get 3 months free.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, absolutely. No lock-in, no cancellation fees. Your data remains accessible on the Free plan after cancellation.',
  },
  {
    q: 'Do you offer student or NGO discounts?',
    a: 'Yes — students with a valid .edu/.ac.in email get 50% off Pro. Registered NGOs and financial literacy programmes get Pro free. Contact us.',
  },
]

export default function PricingPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-4xl font-bold text-slate-100">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 text-lg">Start free. Upgrade when you need real data and advanced features.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-800/50 text-green-400 text-sm">
          <Zap size={14} /> All core analytics are free forever — no catch
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PLANS.map(plan => (
          <div key={plan.name} className={`card p-6 border ${plan.color} relative flex flex-col ${plan.highlight ? 'ring-1 ring-blue-500' : ''}`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1">
                <Star size={10} /> Most Popular
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.highlight ? 'bg-blue-600' : 'bg-[#0b0f1a]'}`}>
                <plan.Icon size={16} className={plan.highlight ? 'text-white' : 'text-slate-400'} />
              </div>
              <h3 className="font-bold text-slate-100">{plan.name}</h3>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-bold font-mono text-slate-100">{plan.price}</span>
              <span className="text-slate-500 text-sm">{plan.period}</span>
            </div>
            <p className="text-sm text-slate-400 mb-5">{plan.desc}</p>
            <Link to={plan.ctaTo}
              className={`w-full text-center py-2.5 rounded-lg font-semibold text-sm mb-6 transition-colors ${plan.highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0b0f1a] border border-[#1e2d45] text-slate-300 hover:border-blue-500'}`}>
              {plan.cta}
            </Link>
            <div className="space-y-2 flex-1">
              {plan.features.map(f => (
                <div key={f.text} className="flex items-start gap-2 text-sm">
                  {f.yes
                    ? <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                    : <X size={14} className="text-slate-700 mt-0.5 shrink-0" />}
                  <span className={f.yes ? 'text-slate-300' : 'text-slate-600'}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison note */}
      <div className="card p-5 border border-amber-800/30 bg-amber-900/5">
        <div className="flex gap-3 items-start">
          <Star size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-400">
            <strong className="text-slate-300">YourDhan vs alternatives:</strong> Bloomberg Terminal costs ₹25 lakh/year.
            Morningstar Direct costs ₹8 lakh/year. YourDhan offers institutional-quality analytics for ₹0–₹2,999/month —
            built specifically for the Indian retail investor and SEBI-registered advisor.
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ.map(item => (
            <div key={item.q} className="card p-5">
              <h3 className="font-semibold text-slate-200 mb-2 text-sm">{item.q}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-4 space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Start analysing your portfolio today</h2>
        <p className="text-slate-400">No registration. No credit card. Just open and go.</p>
        <Link to="/tools/portfolio-performance" className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
          <TrendingUp size={18} /> Open Portfolio Builder
        </Link>
      </div>
    </div>
  )
}
