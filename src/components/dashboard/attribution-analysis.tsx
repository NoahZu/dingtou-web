'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, formatPct, toCNY } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Cell,
} from 'recharts';
import type { HoldingCategory } from '@/lib/types';

const CATEGORY_META: Record<HoldingCategory, { label: string; color: string }> = {
  dca: { label: '定投仓', color: '#2563eb' },
  value: { label: '价值仓', color: '#7c3aed' },
  dividend: { label: '收息仓', color: '#16a34a' },
  legacy: { label: '存量仓', color: '#ea580c' },
};

export function AttributionAnalysis() {
  const { holdings, exchangeRates } = useStore();

  if (holdings.length === 0) return null;

  const categories = Object.keys(CATEGORY_META) as HoldingCategory[];

  const data = categories.map((cat) => {
    const items = holdings.filter((h) => h.category === cat);
    const cost = items.reduce((s, h) => s + toCNY(h.avgCost * h.quantity, h.currency, exchangeRates), 0);
    const market = items.reduce((s, h) => {
      const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
      return s + toCNY(price * h.quantity, h.currency, exchangeRates);
    }, 0);
    const pnl = market - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    const meta = CATEGORY_META[cat];

    return {
      key: cat,
      label: meta.label,
      color: meta.color,
      cost,
      market,
      pnl,
      pnlPct,
      count: items.length,
    };
  }).filter((d) => d.count > 0);

  const totalPnL = data.reduce((s, d) => s + d.pnl, 0);

  const chartData = data.map((d) => ({
    name: d.label,
    浮盈: Math.round(d.pnl),
    color: d.color,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">收益归因分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 子系统明细 */}
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">{d.label}</span>
                  <span className={`text-sm font-medium ${
                    d.pnl > 0 ? 'text-red-600' : d.pnl < 0 ? 'text-green-600' : ''
                  }`}>
                    {d.pnl > 0 ? '+' : ''}{formatCurrency(d.pnl, 'CNY')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.count} 只 · 成本 {formatCurrency(d.cost, 'CNY')}</span>
                  <span>{d.pnlPct > 0 ? '+' : ''}{formatPct(d.pnlPct)}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-2 text-sm font-medium">
            <span>合计浮盈</span>
            <span className={totalPnL > 0 ? 'text-red-600' : totalPnL < 0 ? 'text-green-600' : ''}>
              {totalPnL > 0 ? '+' : ''}{formatCurrency(totalPnL, 'CNY')}
            </span>
          </div>
        </div>

        {/* 柱状图 */}
        {chartData.length > 1 && (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => v >= 10000 || v <= -10000 ? `${(v / 10000).toFixed(0)}万` : String(v)}
                width={50}
              />
              <RechartsTooltip
                formatter={(value) => [formatCurrency(Number(value), 'CNY'), '浮盈']}
              />
              <Bar dataKey="浮盈" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
