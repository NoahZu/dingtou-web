'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, toCNY } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend,
} from 'recharts';
import type { NetWorthSnapshot } from '@/lib/types';

export function NetWorthChart() {
  const {
    holdings, pools, exchangeRates,
    netWorthHistory, addNetWorthSnapshot, deleteNetWorthSnapshot,
  } = useStore();

  const recordSnapshot = () => {
    const today = new Date().toISOString().slice(0, 10);

    const breakdown = { dca: 0, value: 0, dividend: 0, legacy: 0, cash: 0 };
    let marketValue = 0;

    holdings.forEach((h) => {
      const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
      const mv = toCNY(price * h.quantity, h.currency, exchangeRates);
      marketValue += mv;
      breakdown[h.category] += mv;
    });

    const cashTotal = pools.reduce(
      (sum, p) => sum + toCNY(p.balance, p.currency, exchangeRates), 0,
    );
    breakdown.cash = cashTotal;

    const snapshot: NetWorthSnapshot = {
      date: today,
      marketValue,
      cashTotal,
      totalAssets: marketValue + cashTotal,
      breakdown,
    };

    addNetWorthSnapshot(snapshot);
    toast.success(`已记录 ${today} 的净值快照`);
  };

  const history = netWorthHistory ?? [];

  const chartData = history.map((s) => ({
    date: s.date.slice(5),
    总资产: Math.round(s.totalAssets),
    证券: Math.round(s.marketValue),
    现金: Math.round(s.cashTotal),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">历史净值曲线</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={recordSnapshot}>
            <Camera className="mr-1 h-3.5 w-3.5" />
            记录今日快照
          </Button>
          {history.length > 0 && (
            <Button size="sm" variant="ghost" className="text-destructive"
              onClick={() => {
                const last = history[history.length - 1];
                if (confirm(`删除 ${last.date} 的快照？`)) {
                  deleteNetWorthSnapshot(last.date);
                  toast.success('已删除');
                }
              }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            {chartData.length === 0
              ? '暂无数据。请点击「记录今日快照」开始追踪净值。'
              : '至少需要 2 个快照才能绘制曲线。建议每月记录一次。'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`}
                width={50}
              />
              <RechartsTooltip
                formatter={(value) => [formatCurrency(Number(value), 'CNY'), '']}
              />
              <Legend />
              <Line type="monotone" dataKey="总资产" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="证券" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="现金" stroke="#16a34a" strokeWidth={1.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
