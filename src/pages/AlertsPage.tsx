import { useState } from 'react'
import { Bell, BellOff, Plus, Trash2, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { MOCK_STOCKS } from '../data/mockStocks'

type AlertType = 'above' | 'below' | 'pct_up' | 'pct_down'
interface PriceAlert {
  id: string
  ticker: string
  type: AlertType
  value: number
  active: boolean
  createdAt: string
  triggeredAt?: string
}

const TYPE_LABELS: Record<AlertType, string> = {
  above: 'Price above',
  below: 'Price below',
  pct_up: '% gain from current',
  pct_down: '% drop from current',
}

const SEED_ALERTS: PriceAlert[] = [
  { id: '1', ticker: 'RELIANCE', type: 'above', value: 3000, active: true, createdAt: '2025-03-01' },
  { id: '2', ticker: 'TCS', type: 'below', value: 3500, active: true, createdAt: '2025-03-10' },
  { id: '3', ticker: 'HDFCBANK', type: 'pct_up', value: 10, active: true, createdAt: '2025-04-01' },
  { id: '4', ticker: 'INFY', type: 'above', value: 1800, active: false, createdAt: '2025-02-14', triggeredAt: '2025-03-22' },
]

function AlertBadge({ type }: { type: AlertType }) {
  const cfg: Record<AlertType, { label: string; cls: string }> = {
    above: { label: '▲ Above', cls: 'bg-green-900/40 text-green-400 border border-green-800' },
    below: { label: '▼ Below', cls: 'bg-red-900/40 text-red-400 border border-red-800' },
    pct_up: { label: '📈 +%', cls: 'bg-blue-900/40 text-blue-400 border border-blue-800' },
    pct_down: { label: '📉 -%', cls: 'bg-amber-900/40 text-amber-400 border border-amber-800' },
  }
  const { label, cls } = cfg[type]
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>{label}</span>
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(SEED_ALERTS)
  const [showForm, setShowForm] = useState(false)
  const [ticker, setTicker] = useState('')
  const [type, setType] = useState<AlertType>('above')
  const [value, setValue] = useState('')

  const addAlert = () => {
    if (!ticker || !value) return
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      type,
      value: Number(value),
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setAlerts(prev => [newAlert, ...prev])
    setTicker(''); setValue(''); setShowForm(false)
  }

  const toggleAlert = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))

  const deleteAlert = (id: string) =>
    setAlerts(prev => prev.filter(a => a.id !== id))

  const active = alerts.filter(a => a.active)
  const inactive = alerts.filter(a => !a.active)

  const getStock = (t: string) => MOCK_STOCKS.find(s => s.ticker === t)

  const alertDescription = (a: PriceAlert) => {
    const s = getStock(a.ticker)
    const price = s?.currentPrice ?? 0
    if (a.type === 'above') return `Alert when ${a.ticker} trades above ₹${a.value.toLocaleString('en-IN')}`
    if (a.type === 'below') return `Alert when ${a.ticker} drops below ₹${a.value.toLocaleString('en-IN')}`
    if (a.type === 'pct_up') return `Alert when ${a.ticker} gains ${a.value}% from ₹${price.toLocaleString('en-IN')} → ₹${(price * (1 + a.value / 100)).toFixed(0)}`
    return `Alert when ${a.ticker} drops ${a.value}% from ₹${price.toLocaleString('en-IN')} → ₹${(price * (1 - a.value / 100)).toFixed(0)}`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="text-blue-400" size={28} /> Price Alerts
          </h1>
          <p className="text-slate-400 mt-1">Get notified when stocks hit your target prices</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Alert
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Alerts', val: active.length, color: 'text-green-400' },
          { label: 'Triggered', val: inactive.length, color: 'text-amber-400' },
          { label: 'Total', val: alerts.length, color: 'text-blue-400' },
        ].map(m => (
          <div key={m.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${m.color}`}>{m.val}</div>
            <div className="text-xs text-slate-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Create alert form */}
      {showForm && (
        <div className="card p-5 border border-blue-500/30">
          <h3 className="text-slate-200 font-semibold mb-4">Create New Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Stock</label>
              <select value={ticker} onChange={e => setTicker(e.target.value)}
                className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500">
                <option value="">Select stock...</option>
                {MOCK_STOCKS.map(s => (
                  <option key={s.ticker} value={s.ticker}>{s.ticker} — {s.name} (₹{s.currentPrice.toLocaleString('en-IN')})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Alert Type</label>
              <select value={type} onChange={e => setType(e.target.value as AlertType)}
                className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500">
                {(Object.entries(TYPE_LABELS) as [AlertType, string][]).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">
                {type === 'pct_up' || type === 'pct_down' ? 'Percentage (%)' : 'Target Price (₹)'}
              </label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)}
                placeholder={type === 'pct_up' || type === 'pct_down' ? 'e.g. 10' : 'e.g. 3000'}
                className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500" />
            </div>
            {ticker && (
              <div className="flex items-center">
                <div className="bg-[#0b0f1a] rounded p-3 text-sm text-slate-400 w-full">
                  <span className="text-slate-500 text-xs block mb-1">Current Price</span>
                  <span className="font-mono text-slate-200 font-semibold text-lg">
                    ₹{(getStock(ticker)?.currentPrice ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addAlert} disabled={!ticker || !value}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              Create Alert
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      {/* Active alerts */}
      {active.length > 0 && (
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <Bell size={16} className="text-green-400" /> Active Alerts ({active.length})
          </h3>
          <div className="space-y-3">
            {active.map(a => {
              const s = getStock(a.ticker)
              return (
                <div key={a.id} className="flex items-center gap-4 p-3 bg-[#0b0f1a] rounded-lg border border-[#1e2d45]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-slate-100">{a.ticker}</span>
                      <AlertBadge type={a.type} />
                      <span className="text-xs text-slate-500">{a.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{alertDescription(a)}</p>
                  </div>
                  {s && (
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">Current</div>
                      <div className="font-mono text-slate-300 text-sm">₹{s.currentPrice.toLocaleString('en-IN')}</div>
                    </div>
                  )}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => toggleAlert(a.id)} title="Disable alert"
                      className="p-2 text-green-400 hover:text-amber-400 hover:bg-amber-900/20 rounded transition-colors">
                      <Bell size={14} />
                    </button>
                    <button onClick={() => deleteAlert(a.id)}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Triggered/inactive alerts */}
      {inactive.length > 0 && (
        <div className="card p-4">
          <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <BellOff size={16} className="text-slate-500" /> Triggered / Inactive ({inactive.length})
          </h3>
          <div className="space-y-3">
            {inactive.map(a => (
              <div key={a.id} className="flex items-center gap-4 p-3 bg-[#0b0f1a] rounded-lg border border-slate-800 opacity-60">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold text-slate-300">{a.ticker}</span>
                    <AlertBadge type={a.type} />
                    {a.triggeredAt && <span className="text-xs text-amber-400">Triggered {a.triggeredAt}</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{alertDescription(a)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleAlert(a.id)} title="Re-enable"
                    className="p-2 text-slate-500 hover:text-green-400 hover:bg-green-900/20 rounded transition-colors">
                    <Bell size={14} />
                  </button>
                  <button onClick={() => deleteAlert(a.id)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Bell size={56} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium text-slate-400">No alerts set</p>
          <p className="text-sm mt-1">Create your first price alert to get notified when stocks hit your targets</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={16} /> Create Alert
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-900/10 border border-blue-800/30 rounded-lg p-4">
        <div className="flex gap-3">
          <Target size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-400">
            <strong className="text-slate-300">How alerts work:</strong> Alerts are stored locally in your browser. In a production environment,
            alerts would be sent via email or push notifications. Set target prices to help you buy on dips or take profits at highs.
          </div>
        </div>
      </div>
    </div>
  )
}
