import { useState, useMemo } from 'react'
import { CORRELATION_MATRIX, CORRELATION_LABELS } from '../../data/mockData'
import { pearsonCorrelation } from '../../lib/finance'

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function heatColor(r: number): string {
  const norm = (r + 1) / 2
  if (norm < 0.5) {
    const t = norm * 2
    return `rgb(${Math.round(lerp(239,30,t))},${Math.round(lerp(68,29,t))},${Math.round(lerp(68,69,t))})`
  }
  const t = (norm - 0.5) * 2
  return `rgb(${Math.round(lerp(30,59,t))},${Math.round(lerp(29,130,t))},${Math.round(lerp(69,246,t))})`
}

function interpretCorr(r: number): string {
  const a = Math.abs(r)
  if (a >= 0.8) return r > 0 ? 'Highly correlated' : 'Highly inverse'
  if (a >= 0.5) return r > 0 ? 'Moderately correlated' : 'Moderately inverse'
  if (a >= 0.3) return r > 0 ? 'Weakly correlated' : 'Weakly inverse'
  return 'Uncorrelated'
}

export default function CorrelationPage() {
  const [selected, setSelected] = useState<string[]>(CORRELATION_LABELS)
  const [period, setPeriod] = useState<'5Y'|'10Y'|'20Y'|'Max'>('Max')
  const [tooltip, setTooltip] = useState<{ x: string; y: string; r: number } | null>(null)

  const matrix = useMemo(() => {
    const scale = { '5Y': 0.95, '10Y': 0.97, '20Y': 0.99, 'Max': 1 }[period]
    return CORRELATION_MATRIX.map(row => row.map(v => v * scale))
  }, [period])

  const indices = useMemo(() => selected.map(s => CORRELATION_LABELS.indexOf(s)).filter(i => i >= 0), [selected])

  const divScore = useMemo(() => {
    if (indices.length < 2) return 0
    let sum = 0, count = 0
    for (let i = 0; i < indices.length; i++)
      for (let j = i + 1; j < indices.length; j++) { sum += Math.abs(matrix[indices[i]][indices[j]]); count++ }
    return count > 0 ? 1 - sum / count : 0
  }, [indices, matrix])

  const pairs = useMemo(() => {
    const result: Array<{ a: string; b: string; r: number }> = []
    for (let i = 0; i < indices.length; i++)
      for (let j = i + 1; j < indices.length; j++)
        result.push({ a: CORRELATION_LABELS[indices[i]], b: CORRELATION_LABELS[indices[j]], r: matrix[indices[i]][indices[j]] })
    return result.sort((a, b) => a.r - b.r)
  }, [indices, matrix])

  const divColor = divScore > 0.7 ? 'text-green-400' : divScore > 0.4 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Correlation Matrix</h1>
        <p className="text-slate-400 mt-1">Measure how assets move together — key to true portfolio diversification</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-1">
          {(['5Y','10Y','20Y','Max'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded text-sm transition-colors ${period === p ? 'bg-blue-600 text-white' : 'bg-[#131929] border border-[#1e2d45] text-slate-400 hover:border-slate-600'}`}>{p}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {CORRELATION_LABELS.map(label => (
            <label key={label} className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={selected.includes(label)}
                onChange={() => setSelected(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label])}
                className="accent-blue-500" />
              <span className="text-sm text-slate-400">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card p-4 overflow-x-auto">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Correlation Heatmap</h2>
          <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
            <span className="px-2 py-0.5 rounded" style={{ background: heatColor(-1) }}>−1</span>
            <span className="px-2 py-0.5 rounded bg-[#1e2435]">0</span>
            <span className="px-2 py-0.5 rounded" style={{ background: heatColor(1) }}>+1</span>
          </div>
        </div>
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr>
              <th className="w-12" />
              {indices.map(i => <th key={i} className="p-1 text-slate-400 font-medium text-center">{CORRELATION_LABELS[i]}</th>)}
            </tr>
          </thead>
          <tbody>
            {indices.map(ri => (
              <tr key={ri}>
                <td className="pr-2 text-right text-slate-400 font-medium">{CORRELATION_LABELS[ri]}</td>
                {indices.map(ci => {
                  const r = matrix[ri][ci]
                  const isDiag = ri === ci
                  return (
                    <td key={ci} onMouseEnter={() => !isDiag && setTooltip({ x: CORRELATION_LABELS[ri], y: CORRELATION_LABELS[ci], r })}
                      onMouseLeave={() => setTooltip(null)}
                      className="relative cursor-default"
                      style={{ background: isDiag ? '#1e2435' : heatColor(r), padding: '6px 4px', textAlign: 'center', borderRadius: 4, border: '2px solid #0b0f1a' }}>
                      <span className="font-mono font-semibold" style={{ color: isDiag ? '#94a3b8' : Math.abs(r) > 0.4 ? '#fff' : '#1e2435' }}>
                        {r.toFixed(2)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {tooltip && (
          <div className="mt-2 text-xs text-slate-400">
            <span className="text-slate-200 font-medium">{tooltip.x}</span> vs <span className="text-slate-200 font-medium">{tooltip.y}</span>: <span className="font-mono text-blue-400">{tooltip.r.toFixed(3)}</span> — {interpretCorr(tooltip.r)}
          </div>
        )}
      </div>

      {/* Diversification Score */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-200 font-semibold">Diversification Score</h3>
            <p className="text-slate-500 text-sm">1 − mean(|off-diagonal correlations|)</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold font-mono ${divColor}`}>{divScore.toFixed(2)}</div>
            <div className={`text-sm ${divColor}`}>{divScore > 0.7 ? '✓ Well diversified' : divScore > 0.4 ? '⚠ Moderate' : '✗ Low diversification'}</div>
          </div>
        </div>
        <div className="mt-3 h-3 bg-[#0b0f1a] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${divScore * 100}%`, background: divScore > 0.7 ? '#22c55e' : divScore > 0.4 ? '#f59e0b' : '#ef4444' }} />
        </div>
      </div>

      {/* Pair table */}
      <div className="card p-4">
        <h3 className="text-slate-200 font-semibold mb-3">All Correlation Pairs (sorted)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left pb-2">Asset A</th><th className="text-left pb-2">Asset B</th>
                <th className="text-right pb-2">Correlation</th><th className="text-left pb-2 pl-4">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map(({ a, b, r }) => (
                <tr key={`${a}-${b}`} className="border-b border-slate-800/50">
                  <td className="py-1.5 font-mono text-slate-300">{a}</td>
                  <td className="py-1.5 font-mono text-slate-300">{b}</td>
                  <td className="py-1.5 text-right font-mono" style={{ color: heatColor(r) }}>{r.toFixed(3)}</td>
                  <td className="py-1.5 pl-4 text-slate-500 text-xs">{interpretCorr(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
