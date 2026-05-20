import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import FormulaTooltip from './FormulaTooltip';

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  trend?: 'up' | 'down' | 'neutral';
  formulaKey?: string;
  colorRule?: 'gain' | 'loss' | 'sharpe' | 'beta' | 'neutral';
  subtitle?: string;
  className?: string;
}

function getValueColor(
  value: string | number,
  colorRule?: MetricCardProps['colorRule']
): string {
  if (colorRule === 'neutral' || !colorRule) return '#f1f5f9';
  if (colorRule === 'gain') return '#22c55e';
  if (colorRule === 'loss') return '#ef4444';

  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return '#f1f5f9';

  if (colorRule === 'sharpe') {
    if (num >= 2) return '#22c55e';
    if (num >= 1) return '#86efac';
    if (num >= 0.5) return '#f59e0b';
    return '#ef4444';
  }
  if (colorRule === 'beta') {
    if (num < 0.8) return '#22c55e';
    if (num <= 1.2) return '#f1f5f9';
    return '#ef4444';
  }
  return '#f1f5f9';
}

function DeltaBadge({ delta, trend }: { delta: number; trend?: 'up' | 'down' | 'neutral' }) {
  const effectiveTrend = trend ?? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral');
  const isUp = effectiveTrend === 'up';
  const isDown = effectiveTrend === 'down';

  const color = isUp ? '#22c55e' : isDown ? '#ef4444' : '#94a3b8';
  const bg = isUp
    ? 'rgba(34,197,94,0.12)'
    : isDown
    ? 'rgba(239,68,68,0.12)'
    : 'rgba(148,163,184,0.1)';

  const formatted = `${Math.abs(delta) >= 100 ? Math.abs(delta).toFixed(0) : Math.abs(delta) >= 10 ? Math.abs(delta).toFixed(1) : Math.abs(delta).toFixed(2)}%`;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        background: bg,
        color,
        borderRadius: '6px',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'monospace',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {isUp ? (
        <TrendingUp size={10} />
      ) : isDown ? (
        <TrendingDown size={10} />
      ) : (
        <Minus size={10} />
      )}
      {isUp ? '+' : isDown ? '-' : ''}
      {formatted}
    </span>
  );
}

export default function MetricCard({
  label,
  value,
  delta,
  trend,
  formulaKey,
  colorRule,
  subtitle,
  className = '',
}: MetricCardProps) {
  const valueColor = getValueColor(value, colorRule);

  return (
    <div
      className={`card ${className}`}
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        position: 'relative',
        transition: 'background 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#1a2235';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#131929';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        {formulaKey && <FormulaTooltip formulaKey={formulaKey} />}
      </div>

      {/* Value */}
      <span
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: valueColor,
          fontFamily: "'JetBrains Mono', monospace",
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>

      {/* Delta + subtitle row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {delta !== undefined && <DeltaBadge delta={delta} trend={trend} />}
        {subtitle && (
          <span style={{ fontSize: '11px', color: '#64748b' }}>{subtitle}</span>
        )}
      </div>
    </div>
  );
}
