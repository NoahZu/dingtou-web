'use client';

import { useStore } from '@/lib/store';
import { toCNY, formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS: Record<string, string> = {
  '应急金': '#3b82f6',
  '暴跌弹药池': '#f97316',
  '收息股加仓池': '#10b981',
  '富途美元池': '#8b5cf6',
};

export function PoolBarChart() {
  const { pools, exchangeRates } = useStore();

  const data = pools.map((p) => ({
    name: p.label,
    balance: toCNY(p.balance, p.currency, exchangeRates),
    initial: toCNY(p.initialBalance, p.currency, exchangeRates),
  }));

  if (data.length === 0) return null;

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`} />
          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [formatCurrency(Number(value), 'CNY'), '余额']} />
          <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={COLORS[d.name] ?? '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
