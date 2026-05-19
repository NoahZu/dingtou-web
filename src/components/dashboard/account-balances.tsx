'use client';

import { useStore } from '@/lib/store';
import { toCNY, formatCurrency } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Account, Currency } from '@/lib/types';

const ACCOUNT_LABELS: Record<Account, string> = {
  futu: '富途',
  xueqiu: '雪球',
  webank: '微众',
};

export function AccountBalances() {
  const { holdings, pools, exchangeRates } = useStore();

  // 按账户汇总持仓市值
  const accountMV: Record<Account, Record<Currency, number>> = {
    futu: { USD: 0, HKD: 0, CNY: 0 },
    xueqiu: { USD: 0, HKD: 0, CNY: 0 },
    webank: { USD: 0, HKD: 0, CNY: 0 },
  };

  holdings.forEach((h) => {
    const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
    accountMV[h.account][h.currency] += price * h.quantity;
  });

  // 富途现金
  const futuPool = pools.find((p) => p.name === 'futu_usd');
  if (futuPool) accountMV.futu.USD += futuPool.balance;

  // 雪球现金（假设池子中非富途非微众的钱在雪球）
  // 微众 = 应急金 + 暴跌弹药池 + 收息股池
  const webankPools = pools.filter((p) => ['emergency', 'crash_ammo', 'dividend_pool'].includes(p.name));
  webankPools.forEach((p) => { accountMV.webank.CNY += p.balance; });

  const accounts = (['futu', 'xueqiu', 'webank'] as Account[]).map((acc) => {
    const mvByC = accountMV[acc];
    const totalCNY = Object.entries(mvByC).reduce((s, [c, v]) =>
      s + toCNY(v, c as Currency, exchangeRates), 0
    );
    const details = Object.entries(mvByC)
      .filter(([, v]) => v > 0)
      .map(([c, v]) => formatCurrency(v, c as Currency));
    return { name: ACCOUNT_LABELS[acc], totalCNY, details };
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">各账户余额</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div key={acc.name} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{acc.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {acc.details.join(' + ')}
                </span>
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(acc.totalCNY, 'CNY')}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
