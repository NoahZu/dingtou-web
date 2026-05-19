/**
 * 触发价计算引擎
 * 根据当前价格和策略配置，计算各标的的触发状态
 */

import type { Holding, TriggerThreshold } from './types';
import {
  DIVIDEND_TRIGGERS,
  VALUE_TRIGGERS,
  TENCENT_REDUCE_TRIGGER,
  CRASH_TRIGGERS,
} from '@/config/strategy';

export interface TriggerStatus {
  symbol: string;
  name: string;
  type: 'dividend' | 'value' | 'reduce' | 'crash';
  currentPrice: number;
  currency: string;
  // 收息股专用
  annualDividend?: number;
  currentYield?: number;
  // 当前匹配的档位
  matchedThreshold: TriggerThreshold | null;
  // 下一档触发价
  nextTriggerPrice?: number;
  nextTriggerLabel?: string;
  distancePct?: number;
  // 状态
  triggered: boolean;
  statusLabel: string;
  amountCNY: number;
}

/** 计算收息股触发状态（文档 4.3 节） */
export function computeDividendTriggers(holdings: Holding[]): TriggerStatus[] {
  return DIVIDEND_TRIGGERS.map((rule) => {
    const holding = holdings.find((h) => h.symbol === rule.symbol);
    const currentPrice = holding?.currentPrice ?? 0;
    const dividendYield = currentPrice > 0 && rule.annualDividend
      ? (rule.annualDividend / currentPrice) * 100
      : 0;

    let matched: TriggerThreshold | null = null;
    let nextThreshold: TriggerThreshold | null = null;

    // 从高股息率（低价）到低股息率（高价）遍历，匹配第一个命中
    const sorted = [...rule.thresholds].sort((a, b) => (b.minYield ?? 0) - (a.minYield ?? 0));

    for (const t of sorted) {
      const yieldMatch =
        (t.minYield === undefined || dividendYield >= t.minYield) &&
        (t.maxYield === undefined || dividendYield < t.maxYield);

      if (currentPrice > 0 && yieldMatch) {
        matched = t;
        break;
      }
    }

    // 找下一个可触发的档位（比当前更激进的）
    if (matched) {
      const actionable = rule.thresholds.filter((t) => t.action === 'add' || t.action === 'double' || t.action === 'heavy');
      if (matched.action === 'no_add' || matched.action === 'hold') {
        nextThreshold = actionable[0] ?? null;
      }
    } else if (currentPrice > 0) {
      const actionable = rule.thresholds.filter((t) => t.action === 'add' || t.action === 'double' || t.action === 'heavy');
      nextThreshold = actionable[0] ?? null;
    }

    const triggered = matched !== null && (matched.action === 'add' || matched.action === 'double' || matched.action === 'heavy');
    const nextPrice = nextThreshold?.maxPrice ?? nextThreshold?.minPrice;
    const distancePct = currentPrice > 0 && nextPrice
      ? ((nextPrice - currentPrice) / currentPrice) * 100
      : undefined;

    return {
      symbol: rule.symbol,
      name: rule.name,
      type: 'dividend' as const,
      currentPrice,
      currency: rule.currency ?? 'HKD',
      annualDividend: rule.annualDividend,
      currentYield: dividendYield,
      matchedThreshold: matched,
      nextTriggerPrice: nextPrice,
      nextTriggerLabel: nextThreshold?.label,
      distancePct,
      triggered,
      statusLabel: matched?.label ?? (currentPrice > 0 ? '❌ 不加' : '⏳ 等待录价'),
      amountCNY: matched?.amountCNY ?? 0,
    };
  });
}

/** 计算美股价值仓触发状态（文档 5.2 节） */
export function computeValueTriggers(holdings: Holding[]): TriggerStatus[] {
  return VALUE_TRIGGERS.map((rule) => {
    const holding = holdings.find((h) => h.symbol === rule.symbol);
    const currentPrice = holding?.currentPrice ?? 0;

    let matched: TriggerThreshold | null = null;
    for (const t of rule.thresholds) {
      if (currentPrice > 0 && t.maxPrice && currentPrice <= t.maxPrice) {
        matched = t;
        break;
      }
    }

    const triggered = matched !== null && matched.action === 'add';
    const nextPrice = rule.thresholds[0]?.maxPrice;
    const distancePct = currentPrice > 0 && nextPrice
      ? ((nextPrice - currentPrice) / currentPrice) * 100
      : undefined;

    return {
      symbol: rule.symbol,
      name: rule.name,
      type: 'value' as const,
      currentPrice,
      currency: rule.currency ?? 'USD',
      matchedThreshold: matched,
      nextTriggerPrice: nextPrice,
      nextTriggerLabel: rule.thresholds[0]?.label,
      distancePct,
      triggered,
      statusLabel: matched?.label ?? (currentPrice > 0 ? '🟡 等待' : '⏳ 等待录价'),
      amountCNY: matched?.amountCNY ?? 0,
    };
  });
}

/** 计算腾讯减仓触发状态（文档 7.2 节） */
export function computeTencentTrigger(holdings: Holding[]): TriggerStatus | null {
  const rule = TENCENT_REDUCE_TRIGGER;
  const holding = holdings.find((h) => h.symbol === rule.symbol);
  if (!holding) return null;

  const currentPrice = holding.currentPrice;
  let matched: TriggerThreshold | null = null;

  for (const t of rule.thresholds) {
    if (currentPrice > 0 && t.minPrice && currentPrice >= t.minPrice) {
      matched = t;
    }
  }

  const triggered = matched !== null;

  return {
    symbol: rule.symbol,
    name: rule.name,
    type: 'reduce' as const,
    currentPrice,
    currency: 'HKD',
    matchedThreshold: matched,
    nextTriggerPrice: rule.thresholds[0]?.minPrice,
    nextTriggerLabel: rule.thresholds[0]?.label,
    distancePct: currentPrice > 0 && rule.thresholds[0]?.minPrice
      ? ((rule.thresholds[0].minPrice - currentPrice) / currentPrice) * 100
      : undefined,
    triggered,
    statusLabel: matched?.label ?? (currentPrice > 0 ? '🟡 等待回本' : '⏳ 等待录价'),
    amountCNY: 0,
  };
}

/** ETF 暴跌触发状态 */
export interface CrashTriggerStatus {
  indexName: string;
  currentValue: number;
  recentHigh: number;
  drawdownPct: number;
  triggeredLevel: typeof CRASH_TRIGGERS[number] | null;
}

export function computeCrashTrigger(
  currentValue: number,
  recentHigh: number,
  indexName: string,
): CrashTriggerStatus {
  const drawdown = recentHigh > 0 ? ((recentHigh - currentValue) / recentHigh) * 100 : 0;
  let triggered: typeof CRASH_TRIGGERS[number] | null = null;

  for (const level of [...CRASH_TRIGGERS].reverse()) {
    if (drawdown >= level.drawdown) {
      triggered = level;
      break;
    }
  }

  return { indexName, currentValue, recentHigh, drawdownPct: drawdown, triggeredLevel: triggered };
}
