interface ValuationBadgeProps {
  zone: string;
  ratio: number;
}

interface ZoneStyle {
  color: string;
  bg: string;
  border: string;
  label: string;
}

function getZoneStyle(zone: string): ZoneStyle {
  const z = zone.toLowerCase();

  if (z.includes('significantly') && z.includes('under')) {
    return {
      label: 'Significantly Undervalued',
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.12)',
      border: 'rgba(22,163,74,0.3)',
    };
  }
  if (z.includes('modestly') && z.includes('under')) {
    return {
      label: 'Modestly Undervalued',
      color: '#86efac',
      bg: 'rgba(134,239,172,0.10)',
      border: 'rgba(134,239,172,0.25)',
    };
  }
  if (z.includes('fairly') || z.includes('fair')) {
    return {
      label: 'Fairly Valued',
      color: '#94a3b8',
      bg: 'rgba(148,163,184,0.08)',
      border: 'rgba(148,163,184,0.2)',
    };
  }
  if (z.includes('modestly') && z.includes('over')) {
    return {
      label: 'Modestly Overvalued',
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.10)',
      border: 'rgba(251,146,60,0.25)',
    };
  }
  if (z.includes('significantly') && z.includes('over')) {
    return {
      label: 'Significantly Overvalued',
      color: '#fca5a5',
      bg: 'rgba(252,165,165,0.10)',
      border: 'rgba(252,165,165,0.25)',
    };
  }

  // Fallback: use the raw zone string
  return {
    label: zone,
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.2)',
  };
}

export default function ValuationBadge({ zone, ratio }: ValuationBadgeProps) {
  const style = getZoneStyle(zone);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '8px',
        padding: '5px 10px',
      }}
    >
      {/* Color dot */}
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: style.color,
          flexShrink: 0,
        }}
      />

      {/* Zone label */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: style.color,
          whiteSpace: 'nowrap',
        }}
      >
        {style.label}
      </span>

      {/* Ratio pill */}
      <span
        style={{
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', monospace",
          fontVariantNumeric: 'tabular-nums',
          color: style.color,
          background: `rgba(0,0,0,0.2)`,
          border: `1px solid ${style.border}`,
          borderRadius: '5px',
          padding: '1px 5px',
          opacity: 0.85,
        }}
      >
        {ratio.toFixed(2)}x
      </span>
    </div>
  );
}
