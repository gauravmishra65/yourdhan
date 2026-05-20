export interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  fillOpacity?: number;
  className?: string;
}

function normalize(data: number[]): { x: number; y: number }[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: i / Math.max(data.length - 1, 1),
    y: 1 - (v - min) / range,   // SVG y increases downward, flip
  }));
}

function pointsToPath(pts: { x: number; y: number }[], w: number, h: number): string {
  if (pts.length === 0) return '';
  const pad = 1;
  const usableW = w - pad * 2;
  const usableH = h - pad * 2;

  const coords = pts.map((p) => [pad + p.x * usableW, pad + p.y * usableH] as [number, number]);

  if (coords.length === 1) {
    const [x, y] = coords[0];
    return `M ${x} ${y}`;
  }

  // Smooth curve using cubic bezier with tension
  let d = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 1; i < coords.length; i++) {
    const [x0, y0] = coords[i - 1];
    const [x1, y1] = coords[i];
    const cp1x = x0 + (x1 - x0) * 0.4;
    const cp2x = x1 - (x1 - x0) * 0.4;
    d += ` C ${cp1x} ${y0}, ${cp2x} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export default function Sparkline({
  data,
  color,
  width = 80,
  height = 32,
  strokeWidth = 1.5,
  fillOpacity = 0.12,
  className = '',
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} className={className} />;
  }

  const pts = normalize(data);
  const linePath = pointsToPath(pts, width, height);

  // Determine auto color from first vs last value
  const trend = data[data.length - 1] >= data[0];
  const strokeColor = color ?? (trend ? '#22c55e' : '#ef4444');

  // Fill path: close back along the bottom
  const pad = 1;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;
  const firstX = pad + pts[0].x * usableW;
  const lastX = pad + pts[pts.length - 1].x * usableW;
  const bottom = pad + usableH;
  const fillPath = `${linePath} L ${lastX} ${bottom} L ${firstX} ${bottom} Z`;

  const gradientId = `spark-grad-${strokeColor.replace('#', '')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={fillOpacity * 2} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill */}
      <path d={fillPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={linePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      <circle
        cx={pad + pts[pts.length - 1].x * usableW}
        cy={pad + pts[pts.length - 1].y * usableH}
        r={2}
        fill={strokeColor}
      />
    </svg>
  );
}
