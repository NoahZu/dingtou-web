'use client';

import { useStore } from '@/lib/store';
import { computeValueTriggers, computeTencentTrigger } from '@/lib/trigger-engine';
import { formatNumber } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ValueTriggerTable() {
  const { holdings } = useStore();
  const triggers = computeValueTriggers(holdings);
  const tencentTrigger = computeTencentTrigger(holdings);

  const allTriggers = tencentTrigger ? [...triggers, tencentTrigger] : triggers;

  const sorted = [...allTriggers].sort((a, b) => {
    if (a.triggered && !b.triggered) return -1;
    if (!a.triggered && b.triggered) return 1;
    return 0;
  });

  return (
    <>
      {/* 移动端卡片 */}
      <div className="space-y-3 md:hidden">
        {sorted.map((t) => (
          <div
            key={t.symbol}
            className={cn(
              'rounded-lg border p-3 space-y-2',
              t.triggered && 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {t.triggered && '🔥 '}{t.name}
              </span>
              <Badge
                variant={t.triggered ? 'destructive' : 'secondary'}
                className={cn('text-[10px]', t.triggered && 'animate-pulse')}
              >
                {t.statusLabel}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="block text-muted-foreground">现价</span>
                <span className="text-foreground">
                  {t.currentPrice > 0 ? `$${formatNumber(t.currentPrice, 2)}` : '—'}
                </span>
              </div>
              <div>
                <span className="block text-muted-foreground">触发价</span>
                <span className="text-foreground">
                  {t.nextTriggerPrice
                    ? `${t.type === 'reduce' ? '≥' : '≤'} ${t.currency === 'HKD' ? 'HK$' : '$'}${formatNumber(t.nextTriggerPrice, 0)}`
                    : '—'}
                </span>
              </div>
              <div>
                <span className="block text-muted-foreground">距触发</span>
                <span className={cn(
                  'text-foreground',
                  t.distancePct !== undefined && t.distancePct < 0 && 'text-green-600',
                )}>
                  {t.distancePct !== undefined
                    ? `${t.distancePct > 0 ? '+' : ''}${t.distancePct.toFixed(1)}%`
                    : '—'}
                </span>
              </div>
            </div>
            {t.nextTriggerLabel && (
              <p className="text-[10px] text-muted-foreground">{t.nextTriggerLabel}</p>
            )}
          </div>
        ))}
      </div>

      {/* 桌面端表格 */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标的</TableHead>
              <TableHead className="text-right">当前价</TableHead>
              <TableHead className="text-right">触发价</TableHead>
              <TableHead className="text-right">距离</TableHead>
              <TableHead>触发条件</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((t) => (
              <TableRow
                key={t.symbol}
                className={cn(t.triggered && 'bg-red-50 dark:bg-red-950/20')}
              >
                <TableCell className="font-medium">
                  {t.triggered && <span className="mr-1">🔥</span>}
                  {t.name}
                  <span className="ml-1 text-xs text-muted-foreground">{t.symbol}</span>
                </TableCell>
                <TableCell className="text-right">
                  {t.currentPrice > 0
                    ? `$${formatNumber(t.currentPrice, 2)}`
                    : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  {t.nextTriggerPrice
                    ? `${t.type === 'reduce' ? '≥' : '≤'} ${t.currency === 'HKD' ? 'HK$' : '$'}${formatNumber(t.nextTriggerPrice, 0)}`
                    : '—'}
                </TableCell>
                <TableCell className={cn(
                  'text-right',
                  t.distancePct !== undefined && t.distancePct < 0 && 'text-green-600',
                )}>
                  {t.distancePct !== undefined
                    ? `${t.distancePct > 0 ? '+' : ''}${t.distancePct.toFixed(1)}%`
                    : '—'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {t.nextTriggerLabel ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={t.triggered ? 'destructive' : 'secondary'}
                    className={cn(t.triggered && 'animate-pulse')}
                  >
                    {t.statusLabel}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
