export interface SkeletonLoaderProps {
  type?: 'card' | 'chart' | 'table' | 'text';
  count?: number;
  className?: string;
}

function SkeletonBox({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  style,
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

function CardSkeleton() {
  return (
    <div
      className="card"
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      {/* Label */}
      <SkeletonBox width="45%" height="10px" />
      {/* Value */}
      <SkeletonBox width="65%" height="28px" borderRadius="8px" />
      {/* Delta */}
      <SkeletonBox width="30%" height="10px" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div
      className="card"
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width="30%" height="14px" />
        <div style={{ display: 'flex', gap: '6px' }}>
          {[...Array(5)].map((_, i) => (
            <SkeletonBox key={i} width="32px" height="24px" borderRadius="6px" />
          ))}
        </div>
      </div>
      {/* Chart area */}
      <SkeletonBox width="100%" height="220px" borderRadius="8px" />
      {/* X axis labels */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
        {[...Array(6)].map((_, i) => (
          <SkeletonBox key={i} width="40px" height="10px" />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div
      className="card"
      style={{ overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          padding: '12px 16px',
          borderBottom: '1px solid #1e2d45',
          background: '#1a2235',
        }}
      >
        {[...Array(5)].map((_, i) => (
          <SkeletonBox key={i} height="10px" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(6)].map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
            padding: '12px 16px',
            borderBottom: '1px solid #1e2d45',
          }}
        >
          {[...Array(5)].map((_, colIdx) => (
            <SkeletonBox
              key={colIdx}
              height="12px"
              width={colIdx === 0 ? '70%' : colIdx === 4 ? '50%' : '80%'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function TextSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <SkeletonBox width="100%" height="12px" />
      <SkeletonBox width="92%" height="12px" />
      <SkeletonBox width="85%" height="12px" />
      <SkeletonBox width="95%" height="12px" />
      <SkeletonBox width="60%" height="12px" />
    </div>
  );
}

export default function SkeletonLoader({
  type = 'card',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  if (type === 'chart') {
    return (
      <div className={className}>
        {[...Array(count)].map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={className}>
        {[...Array(count)].map((_, i) => (
          <TableSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={className}>
        {[...Array(count)].map((_, i) => (
          <TextSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Default: card
  return (
    <div
      className={className}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}
    >
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
