import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number, decimals = 2): string {
  const formatted = Math.abs(value * 100).toFixed(decimals);
  return `${value >= 0 ? '+' : '-'}${formatted}%`;
}

export function formatIndianNumber(value: number): string {
  if (Math.abs(value) >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (Math.abs(value) >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrency(value: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

export function colorForReturn(value: number): string {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-slate-400';
}

export function colorForSharpe(value: number): string {
  if (value >= 1.0) return 'text-green-400';
  if (value >= 0.5) return 'text-amber-400';
  return 'text-red-400';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
