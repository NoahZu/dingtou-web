'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, formatPct } from '@/lib/format';
import { GUARDRAILS } from '@/config/strategy';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function AccumulatorTable() {
  const { accumulators } = useStore();

  if (accumulators.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">请先初始化数据</p>
      </div>
    );
  }

  return (
    <>
      {/* 移动端卡片 */}
      <div className="space-y-3 md:hidden">
        {accumulators.map((acc) => {
          const threshold = acc.lotValueCNY * (GUARDRAILS.accumulatorBuyThresholdPct / 100);
          const progressPct = acc.lotValueCNY > 0
            ? Math.min(100, (acc.accumulatedCNY / acc.lotValueCNY) * 100)
            : 0;
          const canBuy = acc.accumulatedCNY >= threshold;
          const gap = acc.lotValueCNY - acc.accumulatedCNY;
          const isStale = acc.lastTriggeredAt && !acc.lastBoughtAt
            && monthsSince(acc.lastTriggeredAt) >= GUARDRAILS.accumulatorStaleMonths;

          return (
            <div key={acc.id} className={cn(
              'rounded-lg border p-3 space-y-2',
              canBuy && 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
            )}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{acc.name}</span>
                {canBuy ? (
                  <Badge variant="default" className="bg-green-600 text-[10px]">可执行买入</Badge>
                ) : isStale ? (
                  <Badge variant="destructive" className="text-[10px]">超12月未买入</Badge>
                ) : acc.accumulatedCNY > 0 ? (
                  <Badge variant="secondary" className="text-[10px]">累积中</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">等待触发</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={progressPct} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatPct(progressPct)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="block text-muted-foreground">一手金额</span>
                  <span className="text-foreground">{formatCurrency(acc.lotValueCNY, 'CNY')}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground">已累积</span>
                  <span className="font-medium text-foreground">{formatCurrency(acc.accumulatedCNY, 'CNY')}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground">距一手</span>
                  <span className="text-foreground">{gap > 0 ? formatCurrency(gap, 'CNY') : '—'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 桌面端表格 */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标的</TableHead>
              <TableHead className="text-right">一手金额</TableHead>
              <TableHead className="text-right">当前累积</TableHead>
              <TableHead className="w-[180px]">进度</TableHead>
              <TableHead className="text-right">距离一手</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>上次触发</TableHead>
              <TableHead>上次买入</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accumulators.map((acc) => {
              const threshold = acc.lotValueCNY * (GUARDRAILS.accumulatorBuyThresholdPct / 100);
              const progressPct = acc.lotValueCNY > 0
                ? Math.min(100, (acc.accumulatedCNY / acc.lotValueCNY) * 100)
                : 0;
              const canBuy = acc.accumulatedCNY >= threshold;
              const gap = acc.lotValueCNY - acc.accumulatedCNY;
              const isStale = acc.lastTriggeredAt && !acc.lastBoughtAt
                && monthsSince(acc.lastTriggeredAt) >= GUARDRAILS.accumulatorStaleMonths;

              return (
                <TableRow key={acc.id} className={cn(canBuy && 'bg-green-50 dark:bg-green-950/20')}>
                  <TableCell className="font-medium">
                    {acc.name}
                    <span className="ml-1 text-xs text-muted-foreground">{acc.symbol}</span>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(acc.lotValueCNY, 'CNY')}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(acc.accumulatedCNY, 'CNY')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progressPct} className="h-2" />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {formatPct(progressPct)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {gap > 0 ? formatCurrency(gap, 'CNY') : '—'}
                  </TableCell>
                  <TableCell>
                    {canBuy ? (
                      <Badge variant="default" className="bg-green-600">可执行买入</Badge>
                    ) : isStale ? (
                      <Badge variant="destructive">超12月未买入</Badge>
                    ) : acc.accumulatedCNY > 0 ? (
                      <Badge variant="secondary">累积中</Badge>
                    ) : (
                      <Badge variant="outline">等待触发</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {acc.lastTriggeredAt ? new Date(acc.lastTriggeredAt).toLocaleDateString('zh-CN') : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {acc.lastBoughtAt ? new Date(acc.lastBoughtAt).toLocaleDateString('zh-CN') : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function monthsSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
}
