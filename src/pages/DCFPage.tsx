import { useState, useMemo } from 'react'
import { MOCK_STOCKS } from '../data/mockStocks'

function dcf(base: number, g1: number, g2: number, wacc: number, years: number) {
  if (wacc <= g2) return { intrinsic: 0, pv1: 0, pv2: 0, yearly: [] }
  let pv1 = 0
  const yearly = Array.from({ length: years }, (_, yr) => {
    const cf = base * Math.pow(1 + g1, yr + 1)
    const pv = cf / Math.pow(1 + wacc, yr + 1)
    pv1 += pv
    return { year: yr + 1, cf: +cf.toFixed(2), pv: +pv.toFixed(2) }
  })
  const tv = (base * Math.pow(1 + g1, years) * (1 + g2)) / (wacc - g2)
  const pv2 = tv / Math.pow(1 + wacc, years)
  return { intrinsic: pv1 + pv2, pv1, pv2, yearly }
}

function fmt(v: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v) }

export default function DCFPage() {
  const [ticker, setTicker] = useState('')
  const [base, setBase] = useState(116.2)
  const [g1, setG1] = useState(0.12)
  const [g2, setG2] = useState(0.04)
  const [wacc, setWacc] = useState(0.102)
  const [stageYears, setStageYears] = useState(10)
  const [mode, setMode] = useState<'eps'|'fcf'>('eps')

  const selectedStock = MOCK_STOCKS.find(s => s.ticker === ticker.toUpperCase())
  const currentPrice = selectedStock?.currentPrice ?? 2847

  const result = useMemo(() => dcf(base, g1, g2, wacc, stageYears), [base, g1, g2, wacc, stageYears])
  const mos = result.intrinsic > 0 ? ((result.intrinsic - currentPrice) / result.intrinsic) * 100 : -999

  const sensRows = [wacc - 0.02, wacc - 0.01, wacc, wacc + 0.01, wacc + 0.02]
  const sensCols = [g1 - 0.02, g1 - 0.01, g1, g1 + 0.01, g1 + 0.02]

  const loadStock = (t: string) => {
    const s = MOCK_STOCKS.find(st => st.ticker === t.toUpperCase())
    if (s) {
      const f = s.financials[0]
      setBase(f.eps)
      setG1(Math.min(0.20, Math.max(0.05, (f.eps - s.financials[4]?.eps) / (s.financials[4]?.eps || f.eps) / 5)))
      setWacc(0.06 + s.beta * 0.055)
    }
  }

  const zone = mos > 30 ? 'Significantly Undervalued' : mos > 10 ? 'Modestly Undervalued' : mos > -10 ? 'Fairly Valued' : mos > -30 ? 'Modestly Overvalued' : 'Significantly Overvalued'
  const mosColor = mos > 10 ? 'text-green-400' : mos > -10 ? 'text-amber-400' : 'text-red-400'
  const zoneColor = mos > 10 ? 'text-green-400' : mos > -10 ? 'text-slate-400' : 'text-red-400'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">DCF Intrinsic Value Calculator</h1>
        <p className="text-slate-400 mt-1">Two-stage Discounted Cash Flow model with WACC-based discount rate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs */}
        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h3 className="text-slate-200 font-semibold">Auto-fill from Stock</h3>
            <div className="flex gap-2">
              <select value={ticker} onChange={e => { setTicker(e.target.value); loadStock(e.target.value) }}
                className="flex-1 bg-[#0b0f1a] border border-[#1e2d45] rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500">
                <option value="">Select NSE stock...</option>
                {MOCK_STOCKS.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker} — {s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <div className="flex gap-3">
              {[['eps','EPS-based'],['fcf','FCF/Share']] .map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={mode===k} onChange={() => setMode(k as typeof mode)} className="accent-blue-500" />
                  <span className="text-sm text-slate-300">{l}</span>
                </label>
              ))}
            </div>

            {[
              { label: mode === 'eps' ? 'EPS (TTM) ₹' : 'FCF/Share (TTM) ₹', val: base, set: setBase, step: 1 },
              { label: 'Stage 1 Growth Rate %', val: g1 * 100, set: (v: number) => setG1(v/100), step: 0.5 },
              { label: 'Stage 1 Years', val: stageYears, set: setStageYears, step: 1 },
              { label: 'Terminal Growth Rate %', val: g2 * 100, set: (v: number) => setG2(v/100), step: 0.25 },
              { label: 'WACC %', val: wacc * 100, set: (v: number) => setWacc(v/100), step: 0.1 },
            ].map(({ label, val, set, step }) => (
              <div key={label}>
                <label className="text-xs text-slate-500 block mb-1">{label}</label>
                <input type="number" value={val} step={step} onChange={e => set(Number(e.target.value))}
                  className="w-full bg-[#0b0f1a] border border-[#1e2d45] rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500" />
              </div>
            ))}

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between"><span>Risk-free rate (10Y Gsec)</span><span className="font-mono">7.2%</span></div>
              <div className="flex justify-between"><span>Equity Risk Premium</span><span className="font-mono">5.5%</span></div>
              <div className="flex justify-between"><span>Ke = Rf + β × ERP</span><span className="font-mono">{((wacc * 100) - 1).toFixed(1)}%</span></div>
            </div>
            <button onClick={() => { setBase(116.2); setG1(0.12); setG2(0.04); setWacc(0.102); setStageYears(10) }}
              className="text-xs text-slate-500 hover:text-slate-300 underline">🔄 Reset to Defaults</button>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-slate-500 text-sm">Intrinsic Value</div>
                <div className="text-4xl font-bold font-mono text-slate-100">{fmt(result.intrinsic)}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 text-sm">Current Price</div>
                <div className="text-2xl font-bold font-mono text-slate-300">{fmt(currentPrice)}</div>
              </div>
            </div>
            <div className={`text-xl font-bold font-mono ${mosColor}`}>
              {mos > 0 ? '+' : ''}{mos.toFixed(1)}% Margin of Safety
            </div>
            <div className={`text-sm font-semibold ${zoneColor}`}>→ {zone}</div>

            {/* Zone bar */}
            <div className="flex h-6 rounded-lg overflow-hidden text-xs font-medium mt-2">
              {[['Sig Under','#166534'],['Mod Under','#15803d'],['Fairly','#374151'],['Mod Over','#92400e'],['Sig Over','#991b1b']].map(([label, bg]) => (
                <div key={label} className="flex-1 flex items-center justify-center text-[9px] text-white" style={{ background: bg }}>{label}</div>
              ))}
            </div>
            <div className="relative h-2">
              <div className="absolute w-3 h-3 rounded-full bg-white border-2 border-slate-800 -top-0.5" style={{ left: `${Math.max(0, Math.min(100, 50 - mos/2))}%` }} />
            </div>
          </div>

          {/* Year-by-year table */}
          <div className="card p-4">
            <h3 className="text-slate-200 font-semibold mb-3">Year-by-Year Cash Flows</h3>
            <div className="overflow-y-auto max-h-52">
              <table className="w-full text-xs">
                <thead><tr className="text-slate-500 border-b border-slate-800"><th className="text-left pb-1">Year</th><th className="text-right pb-1">Projected CF</th><th className="text-right pb-1">Present Value</th></tr></thead>
                <tbody>
                  {result.yearly.map(row => (
                    <tr key={row.year} className="border-b border-slate-800/30">
                      <td className="py-1 text-slate-400">{row.year}</td>
                      <td className="py-1 text-right font-mono text-slate-300">₹{row.cf.toFixed(2)}</td>
                      <td className="py-1 text-right font-mono text-blue-400">₹{row.pv.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-700 font-semibold">
                    <td className="py-1 text-slate-400">Terminal</td>
                    <td className="py-1 text-right font-mono text-slate-300">—</td>
                    <td className="py-1 text-right font-mono text-purple-400">₹{result.pv2.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between text-sm">
              <span className="text-slate-500">Stage 1 PV:</span><span className="font-mono text-slate-300">₹{result.pv1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Terminal PV:</span><span className="font-mono text-slate-300">₹{result.pv2.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold mt-1">
              <span className="text-slate-300">Intrinsic Value:</span><span className="font-mono text-slate-100">₹{result.intrinsic.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensitivity table */}
      <div className="card p-4">
        <h3 className="text-slate-200 font-semibold mb-3">Sensitivity Analysis (Intrinsic Value)</h3>
        <p className="text-xs text-slate-500 mb-3">Rows = WACC, Columns = Stage 1 Growth Rate. Highlighted = current inputs.</p>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-slate-500 border border-slate-800">WACC ↓ / g1 →</th>
                {sensCols.map(c => <th key={c} className="p-2 text-slate-400 border border-slate-800 font-mono">{(c*100).toFixed(1)}%</th>)}
              </tr>
            </thead>
            <tbody>
              {sensRows.map(w => (
                <tr key={w}>
                  <td className="p-2 text-slate-400 border border-slate-800 font-mono">{(w*100).toFixed(1)}%</td>
                  {sensCols.map(g => {
                    const iv = dcf(base, g, g2, w, stageYears).intrinsic
                    const isCurrent = Math.abs(w - wacc) < 0.005 && Math.abs(g - g1) < 0.005
                    const isGood = iv > currentPrice
                    return (
                      <td key={g} className={`p-2 border border-slate-800 text-right font-mono ${isCurrent ? 'ring-2 ring-blue-500' : ''} ${isGood ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                        ₹{iv.toFixed(0)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
