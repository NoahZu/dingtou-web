'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPct, toCNY } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Lock, AlertTriangle, Shield, Flame, DollarSign, Wallet, PenLine, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { PoolName } from '@/lib/types';

const POOL_ICONS = {
  emergency: Shield,
  crash_ammo: Flame,
  dividend_pool: Wallet,
  futu_usd: DollarSign,
} as const;

const POOL_COLORS = {
  emergency: 'text-blue-600',
  crash_ammo: 'text-orange-600',
  dividend_pool: 'text-green-600',
  futu_usd: 'text-purple-600',
} as const;

export function PoolCards() {
  const { pools, exchangeRates, addPoolTransfer } = useStore();
  const [calibrating, setCalibrating] = useState<string | null>(null);
  const [calibrateValue, setCalibrateValue] = useState('');

  if (pools.length === 0) return null;

  const totalCNY = pools.reduce((s, p) => s + toCNY(p.balance, p.currency, exchangeRates), 0);

  function startCalibrate(poolName: string, currentBalance: number) {
    setCalibrating(poolName);
    setCalibrateValue(String(currentBalance));
  }

  function cancelCalibrate() {
    setCalibrating(null);
    setCalibrateValue('');
  }

  function confirmCalibrate(poolName: PoolName, poolLabel: string, oldBalance: number, currency: 'HKD' | 'USD' | 'CNY') {
    const newBalance = Number(calibrateValue);
    if (isNaN(newBalance) || newBalance < 0) {
      toast.error('请输入有效金额');
      return;
    }
    const diff = newBalance - oldBalance;
    if (Math.abs(diff) < 0.01) {
      toast.info('余额无变化');
      cancelCalibrate();
      return;
    }

    const today = new Date().toISOString();
    if (diff > 0) {
      addPoolTransfer({
        date: today,
        from: 'external',
        to: poolName,
        amount: Math.round(diff * 100) / 100,
        currency,
        note: `月度校准：${poolLabel} +${formatCurrency(diff, currency)}`,
      });
    } else {
      addPoolTransfer({
        date: today,
        from: poolName,
        to: 'external',
        amount: Math.round(Math.abs(diff) * 100) / 100,
        currency,
        note: `月度校准：${poolLabel} ${formatCurrency(diff, currency)}`,
      });
    }

    toast.success(`${poolLabel} 已校准：${formatCurrency(oldBalance, currency)} → ${formatCurrency(newBalance, currency)}`);
    cancelCalibrate();
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
      {pools.map((pool) => {
        const Icon = POOL_ICONS[pool.name];
        const color = POOL_COLORS[pool.name];
        const balanceCNY = toCNY(pool.balance, pool.currency, exchangeRates);
        const pctOfTotal = totalCNY > 0 ? (balanceCNY / totalCNY) * 100 : 0;
        const usagePct = pool.initialBalance > 0
          ? (pool.balance / pool.initialBalance) * 100
          : 100;
        const belowWarning = pool.balance < pool.warningThreshold;
        const isCalibrating = calibrating === pool.name;

        return (
          <Card key={pool.name} className={cn(belowWarning && 'border-red-300 dark:border-red-800')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={cn('h-5 w-5', color)} />
                  {pool.label}
                  {pool.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {belowWarning && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      低于警戒线
                    </Badge>
                  )}
                  {!isCalibrating && (
                    <button
                      onClick={() => startCalibrate(pool.name, pool.balance)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      title="校准余额"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isCalibrating ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={calibrateValue}
                    onChange={(e) => setCalibrateValue(e.target.value)}
                    className="h-9 text-lg font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmCalibrate(pool.name, pool.label, pool.balance, pool.currency);
                      if (e.key === 'Escape') cancelCalibrate();
                    }}
                  />
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => confirmCalibrate(pool.name, pool.label, pool.balance, pool.currency)}>
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={cancelCalibrate}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">
                    {formatCurrency(pool.balance, pool.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    占比 {formatPct(pctOfTotal)}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>已使用</span>
                  <span>{formatPct(100 - usagePct)} / 初始 {formatCurrency(pool.initialBalance, pool.currency)}</span>
                </div>
                <Progress value={usagePct} className="h-2" />
              </div>

              {pool.currency !== 'CNY' && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(balanceCNY, 'CNY')}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
