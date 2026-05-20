export interface ColoredPercentProps {
  value: number;       // 0.12 = 12%
  decimals?: number;
  showSign?: boolean;
  className?: string;
}

export default function ColoredPercent({
  value,
  decimals = 2,
  showSign = true,
  className = '',
}: ColoredPercentProps) {
  const pct = value * 100;
  const isPositive = pct > 0;
  const isNegative = pct < 0;
  const isZero = pct === 0;

  const color = isPositive ? '#22c55e' : isNegative ? '#ef4444' : '#94a3b8';
  const arrow = isPositive ? '▲' : isNegative ? '▼' : '—';
  const sign = showSign && isPositive ? '+' : '';

  const formatted = isZero
    ? `${pct.toFixed(decimals)}%`
    : `${sign}${Math.abs(pct).toFixed(decimals)}%`;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        color,
        fontFamily: "'JetBrains Mono', monospace",
        fontVariantNumeric: 'tabular-nums',
        fontSize: 'inherit',
        fontWeight: 'inherit',
      }}
    >
      <span style={{ fontSize: '0.7em', lineHeight: 1 }}>{arrow}</span>
      <span>{formatted}</span>
    </span>
  );
}
