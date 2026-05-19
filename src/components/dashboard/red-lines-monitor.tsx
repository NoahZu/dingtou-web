'use client';

import { useStore } from '@/lib/store';
import { toCNY, formatPct } from '@/lib/format';
import { RED_LINES, SECTOR_MAP } from '@/config/strategy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

interface RedLineItem {
  label: string;
  current: number;
  limit: number;
  rule: string;
  breached: boolean;
}

export function RedLinesMonitor() {
  const { holdings, pools, exchangeRates } = useStore();

  const totalMarketValue = holdings.reduce((sum, h) => {
    const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
    return sum + toCNY(price * h.quantity, h.currency, exchangeRates);
  }, 0);
  const totalCash = pools.reduce((s, p) => s + toCNY(p.balance, p.currency, exchangeRates), 0);
  const totalAssets = totalMarketValue + totalCash;

  if (totalAssets <= 0) return null;

  // 红线 1：单标的 ≤ 25%
  const holdingWeights = holdings.map((h) => {
    const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
    const mv = toCNY(price * h.quantity, h.currency, exchangeRates);
    return { name: h.name, symbol: h.symbol, pct: (mv / totalAssets) * 100 };
  }).sort((a, b) => b.pct - a.pct);
  const topHolding = holdingWeights[0];

  // 红线 2：单板块 ≤ 40%
  const sectorWeights: Record<string, number> = {};
  holdings.forEach((h) => {
    const sector = SECTOR_MAP[h.symbol] ?? '其他';
    const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
    const mv = toCNY(price * h.quantity, h.currency, exchangeRates);
    sectorWeights[sector] = (sectorWeights[sector] ?? 0) + mv;
  });
  const topSector = Object.entries(sectorWeights)
    .map(([name, mv]) => ({ name, pct: (mv / totalAssets) * 100 }))
    .sort((a, b) => b.pct - a.pct)[0];

  // 红线 3：现金 ≥ 10%
  const cashPct = (totalCash / totalAssets) * 100;

  const lines: RedLineItem[] = [
    {
      label: `单标的：${topHolding?.name ?? '—'}`,
      current: topHolding?.pct ?? 0,
      limit: RED_LINES.singleHoldingMaxPct,
      rule: `≤ ${RED_LINES.singleHoldingMaxPct}%`,
      breached: (topHolding?.pct ?? 0) > RED_LINES.singleHoldingMaxPct,
    },
    {
      label: `单板块：${topSector?.name ?? '—'}`,
      current: topSector?.pct ?? 0,
      limit: RED_LINES.singleSectorMaxPct,
      rule: `≤ ${RED_LINES.singleSectorMaxPct}%`,
      breached: (topSector?.pct ?? 0) > RED_LINES.singleSectorMaxPct,
    },
    {
      label: '现金占比',
      current: cashPct,
      limit: RED_LINES.cashMinPct,
      rule: `≥ ${RED_LINES.cashMinPct}%`,
      breached: cashPct < RED_LINES.cashMinPct,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4" />
          三大红线
          <span className="text-xs font-normal text-muted-foreground">文档 9.1 节</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center justify-between rounded-md border px-3 py-2',
                line.breached && 'border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
              )}
            >
              <div>
                <span className="text-sm font-medium">{line.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">规则：{line.rule}</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                line.breached ? 'text-red-600' : 'text-green-600',
              )}>
                {formatPct(line.current)}
                {line.breached ? ' ⚠️' : ' ✓'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
