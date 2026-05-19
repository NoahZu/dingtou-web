'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, formatPct, toCNY } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lock, AlertTriangle, Shield, Flame, DollarSign, Wallet } from 'lucide-react';

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
  const { pools, exchangeRates } = useStore();

  if (pools.length === 0) return null;

  const totalCNY = pools.reduce((s, p) => s + toCNY(p.balance, p.currency, exchangeRates), 0);

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

        return (
          <Card key={pool.name} className={cn(belowWarning && 'border-red-300 dark:border-red-800')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={cn('h-5 w-5', color)} />
                  {pool.label}
                  {pool.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                </CardTitle>
                {belowWarning && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    低于警戒线
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {formatCurrency(pool.balance, pool.currency)}
                </span>
                <span className="text-sm text-muted-foreground">
                  占比 {formatPct(pctOfTotal)}
                </span>
              </div>

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
