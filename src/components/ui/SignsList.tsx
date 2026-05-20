interface SignsListProps {
  warnings: string[];
  goods: string[];
  className?: string;
}

export default function SignsList({ warnings, goods, className = '' }: SignsListProps) {
  const hasWarnings = warnings.length > 0;
  const hasGoods = goods.length > 0;

  if (!hasWarnings && !hasGoods) {
    return (
      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
        No signals available.
      </p>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Good signs */}
      {hasGoods && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4
            style={{
              margin: '0 0 4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#22c55e',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Positive Signals ({goods.length})
          </h4>
          {goods.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '6px 10px',
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: '7px',
                fontSize: '12px',
                color: '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}
                role="img"
                aria-label="good"
              >
                ✅
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warning signs */}
      {hasWarnings && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4
            style={{
              margin: '0 0 4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Warning Signs ({warnings.length})
          </h4>
          {warnings.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '6px 10px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '7px',
                fontSize: '12px',
                color: '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}
                role="img"
                aria-label="warning"
              >
                ⚠️
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
