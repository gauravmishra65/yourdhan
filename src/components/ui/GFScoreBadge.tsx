interface GFScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

interface ScoreTier {
  label: string;
  color: string;
  bg: string;
  border: string;
}

function getTier(score: number): ScoreTier {
  if (score >= 90) {
    return {
      label: 'Outstanding',
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.12)',
      border: 'rgba(22,163,74,0.3)',
    };
  }
  if (score >= 80) {
    return {
      label: 'Good',
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.12)',
      border: 'rgba(74,222,128,0.3)',
    };
  }
  if (score >= 70) {
    return {
      label: 'Fair',
      color: '#facc15',
      bg: 'rgba(250,204,21,0.12)',
      border: 'rgba(250,204,21,0.3)',
    };
  }
  if (score >= 60) {
    return {
      label: 'Warning',
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.12)',
      border: 'rgba(251,146,60,0.3)',
    };
  }
  return {
    label: 'Poor',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
  };
}

const SIZE = {
  sm: { score: '14px', label: '10px', pad: '4px 8px', gap: '4px', circle: '28px', ringW: '3px' },
  md: { score: '18px', label: '11px', pad: '6px 12px', gap: '6px', circle: '40px', ringW: '3px' },
  lg: { score: '24px', label: '13px', pad: '8px 16px', gap: '8px', circle: '56px', ringW: '4px' },
};

export default function GFScoreBadge({ score, size = 'md' }: GFScoreBadgeProps) {
  const tier = getTier(score);
  const s = SIZE[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        background: tier.bg,
        border: `1px solid ${tier.border}`,
        borderRadius: '10px',
        padding: s.pad,
      }}
    >
      {/* Circular score indicator */}
      <div
        style={{
          width: s.circle,
          height: s.circle,
          borderRadius: '50%',
          border: `${s.ringW} solid ${tier.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: tier.bg,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: s.score,
            fontWeight: 700,
            color: tier.color,
            fontFamily: "'JetBrains Mono', monospace",
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {score}
        </span>
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: s.label,
          fontWeight: 600,
          color: tier.color,
          whiteSpace: 'nowrap',
        }}
      >
        {tier.label}
      </span>
    </div>
  );
}
