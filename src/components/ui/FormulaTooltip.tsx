import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { FORMULAS } from '../../lib/formulas';

export interface FormulaTooltipProps {
  formulaKey: string;
  className?: string;
}

export default function FormulaTooltip({ formulaKey, className = '' }: FormulaTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const formula = FORMULAS[formulaKey];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!formula) return null;

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <button
        type="button"
        aria-label={`Formula info for ${formula.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: open ? '#3b82f6' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          transition: 'color 0.15s',
        }}
      >
        <HelpCircle size={13} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '6px',
            width: '280px',
            background: '#1a2235',
            border: '1px solid #1e2d45',
            borderRadius: '10px',
            padding: '14px',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
          // Keep open if hovering the popover itself
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Name */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {formula.name}
          </div>

          {/* Formula string */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: '#f1f5f9',
              background: '#131929',
              border: '1px solid #1e2d45',
              borderRadius: '6px',
              padding: '8px 10px',
              lineHeight: 1.5,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {formula.formula}
          </div>

          {/* Description */}
          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
            {formula.description}
          </div>

          {/* Interpretation */}
          <div
            style={{
              fontSize: '11px',
              color: '#f59e0b',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '6px',
              padding: '6px 8px',
              lineHeight: 1.5,
            }}
          >
            {formula.interpretation}
          </div>

          {/* Unit */}
          <div
            style={{
              fontSize: '10px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Unit:</span>
            <span
              style={{
                fontFamily: 'monospace',
                background: '#131929',
                padding: '1px 5px',
                borderRadius: '4px',
                color: '#94a3b8',
              }}
            >
              {formula.unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
