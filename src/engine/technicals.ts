// Technical indicators for price chart overlays

export function sma(prices: number[], n: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < n - 1) return null;
    const slice = prices.slice(i - n + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / n;
  });
}

export function ema(prices: number[], n: number): number[] {
  const k = 2 / (n + 1);
  const result: number[] = [];
  prices.forEach((p, i) => { result.push(i === 0 ? p : p * k + result[i - 1] * (1 - k)); });
  return result;
}

export function rsi(prices: number[], period = 14): (number | null)[] {
  if (prices.length < period + 1) return prices.map(() => null);
  const result: (number | null)[] = Array(period).fill(null);
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) avgGain += d; else avgLoss += Math.abs(d);
  }
  avgGain /= period; avgLoss /= period;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return result;
}

export function bollingerBands(prices: number[], n = 20, k = 2) {
  const mid = sma(prices, n);
  return prices.map((_, i) => {
    if (i < n - 1) return { mid: null, upper: null, lower: null };
    const slice = prices.slice(i - n + 1, i + 1);
    const mean = mid[i]!;
    const std = Math.sqrt(slice.reduce((a, p) => a + (p - mean) ** 2, 0) / n);
    return { mid: mean, upper: mean + k * std, lower: mean - k * std };
  });
}

export function macd(prices: number[]) {
  const ema12 = ema(prices, 12), ema26 = ema(prices, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = ema(macdLine, 9);
  return { macdLine, signal, histogram: macdLine.map((v, i) => v - signal[i]) };
}

export function atr(highs: number[], lows: number[], closes: number[], period = 14): number[] {
  const trs = highs.map((h, i) => {
    const hl = h - lows[i];
    return i === 0 ? hl : Math.max(hl, Math.abs(h - closes[i-1]), Math.abs(lows[i] - closes[i-1]));
  });
  const result: number[] = Array(period - 1).fill(0);
  let avg = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(avg);
  for (let i = period; i < trs.length; i++) { avg = (avg * (period - 1) + trs[i]) / period; result.push(avg); }
  return result;
}

export function stochasticOscillator(highs: number[], lows: number[], closes: number[], kP = 14, dP = 3) {
  const k = closes.map((c, i) => {
    if (i < kP - 1) return 50;
    const h = Math.max(...highs.slice(i - kP + 1, i + 1));
    const l = Math.min(...lows.slice(i - kP + 1, i + 1));
    return h === l ? 50 : ((c - l) / (h - l)) * 100;
  });
  return { k, d: sma(k, dP).map(v => v ?? 50) };
}
