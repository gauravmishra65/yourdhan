import { useState } from 'react';
import { Download, Maximize2 } from 'lucide-react';
import FormulaTooltip from './FormulaTooltip';

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  formulaKey?: string;
  timeRanges?: string[];
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
  children: React.ReactNode;
  className?: string;
}

const DEFAULT_RANGES = ['5Y', '10Y', '15Y', '20Y', 'Max'];

export default function ChartContainer({
  title,
  subtitle,
  formulaKey,
  timeRanges,
  selectedRange,
  onRangeChange,
  children,
  className = '',
}: ChartContainerProps) {
  const ranges = timeRanges ?? (timeRanges !== undefined ? timeRanges : undefined);
  const showRanges = Array.isArray(timeRanges) && timeRanges.length > 0;
  const [internalRange, setInternalRange] = useState(
    selectedRange ?? (showRanges ? (timeRanges ?? DEFAULT_RANGES)[0] : '')
  );

  const activeRange = selectedRange !== undefined ? selectedRange : internalRange;

  const handleRangeClick = (range: string) => {
    setInternalRange(range);
    onRangeChange?.(range);
  };

  return (
    <div
      className={`card ${className}`}
      style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: '#f1f5f9',
                letterSpacing: '-0.2px',
              }}
            >
              {title}
            </h3>
            {formulaKey && <FormulaTooltip formulaKey={formulaKey} />}
          </div>
          {subtitle && (
            <span style={{ fontSize: '11px', color: '#64748b' }}>{subtitle}</span>
          )}
        </div>

        {/* Right controls: time-range tabs + action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Time-range tabs */}
          {showRanges && (
            <div
              style={{
                display: 'flex',
                gap: '2px',
                background: '#1a2235',
                border: '1px solid #1e2d45',
                borderRadius: '8px',
                padding: '3px',
              }}
            >
              {(timeRanges ?? DEFAULT_RANGES).map((range) => {
                const isActive = range === activeRange;
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => handleRangeClick(range)}
                    style={{
                      background: isActive ? '#3b82f6' : 'transparent',
                      color: isActive ? '#fff' : '#64748b',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                        (e.currentTarget as HTMLButtonElement).style.background = '#131929';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
          )}

          {/* Download button */}
          <button
            type="button"
            title="Download chart data"
            style={{
              background: 'transparent',
              border: '1px solid #1e2d45',
              color: '#64748b',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.color = '#f1f5f9';
              btn.style.borderColor = '#3b82f6';
              btn.style.background = '#1a2235';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.color = '#64748b';
              btn.style.borderColor = '#1e2d45';
              btn.style.background = 'transparent';
            }}
          >
            <Download size={13} />
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            title="Fullscreen"
            style={{
              background: 'transparent',
              border: '1px solid #1e2d45',
              color: '#64748b',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.color = '#f1f5f9';
              btn.style.borderColor = '#3b82f6';
              btn.style.background = '#1a2235';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.color = '#64748b';
              btn.style.borderColor = '#1e2d45';
              btn.style.background = 'transparent';
            }}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Chart content */}
      <div style={{ width: '100%', flex: 1 }}>{children}</div>
    </div>
  );
}
