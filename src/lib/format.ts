import type { Currency } from './types';

const CNY_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const CNY_PRECISE = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const HKD_FORMATTER = new Intl.NumberFormat('zh-HK', {
  style: 'currency',
  currency: 'HKD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PCT_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number, currency: Currency): string {
  switch (currency) {
    case 'CNY': return CNY_FORMATTER.format(value);
    case 'USD': return USD_FORMATTER.format(value);
    case 'HKD': return HKD_FORMATTER.format(value);
  }
}

export function formatCurrencyPrecise(value: number, currency: Currency): string {
  switch (currency) {
    case 'CNY': return CNY_PRECISE.format(value);
    case 'USD': return USD_FORMATTER.format(value);
    case 'HKD': return HKD_FORMATTER.format(value);
  }
}

export function formatPct(value: number): string {
  return PCT_FORMATTER.format(value / 100);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/** 将持仓市值转换为 CNY */
export function toCNY(
  value: number,
  currency: Currency,
  rates: { USDCNY: number; HKDCNY: number },
): number {
  switch (currency) {
    case 'CNY': return value;
    case 'USD': return value * rates.USDCNY;
    case 'HKD': return value * rates.HKDCNY;
  }
}
