'use client';

import { useState } from 'react';
import { computeCrashTrigger } from '@/lib/trigger-engine';
import { formatCurrency } from '@/lib/format';
import { CRASH_TRIGGERS } from '@/config/strategy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function CrashTriggerCard() {
  const [hsi, setHsi] = useState({ current: 0, high: 0 });
  const [nasdaq, setNasdaq] = useState({ current: 0, high: 0 });

  const hsiStatus = computeCrashTrigger(hsi.current, hsi.high, '恒生指数');
  const nasdaqStatus = computeCrashTrigger(nasdaq.current, nasdaq.high, '纳斯达克');

  const renderIndex = (
    label: string,
    state: { current: number; high: number },
    setState: (v: { current: number; high: number }) => void,
    status: ReturnType<typeof computeCrashTrigger>,
  ) => (
    <div className="space-y-3">
      <h4 className="font-medium">{label}</h4>
      <div className="flex gap-3">
        <div className="space-y-1">
          <Label className="text-xs">当前值</Label>
          <Input
            type="number"
            className="h-8 w-28"
            value={state.current || ''}
            onChange={(e) => setState({ ...state, current: Number(e.target.value) })}
            placeholder="输入"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">近期高点</Label>
          <Input
            type="number"
            className="h-8 w-28"
            value={state.high || ''}
            onChange={(e) => setState({ ...state, high: Number(e.target.value) })}
            placeholder="输入"
          />
        </div>
        <div className="flex items-end">
          {status.drawdownPct > 0 ? (
            <Badge variant={status.triggeredLevel ? 'destructive' : 'secondary'}>
              跌幅 {status.drawdownPct.toFixed(1)}%
            </Badge>
          ) : (
            <Badge variant="outline">等待输入</Badge>
          )}
        </div>
      </div>
      {status.drawdownPct > 0 && (
        <div className="space-y-2">
          {CRASH_TRIGGERS.map((level) => {
            const hit = status.drawdownPct >= level.drawdown;
            return (
              <div key={level.drawdown} className="flex items-center gap-2 text-sm">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  hit ? 'bg-red-500' : 'bg-gray-300',
                )} />
                <span className={cn(hit && 'font-medium text-red-600')}>
                  {level.label}
                </span>
                <span className="text-muted-foreground">
                  — {formatCurrency(level.amountCNY, 'CNY')}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({level.targets.join(' + ')})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          ETF 暴跌弹药触发
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            文档 6.1 节 · 监控恒生/纳指跌幅
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderIndex('恒生指数', hsi, setHsi, hsiStatus)}
        {renderIndex('纳斯达克指数', nasdaq, setNasdaq, nasdaqStatus)}
      </CardContent>
    </Card>
  );
}
