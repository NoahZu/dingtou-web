'use client';

import { useStore } from '@/lib/store';
import { toCNY, formatCurrency, formatPct } from '@/lib/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#6366f1', '#ec4899'];

const LAYER_LABELS: Record<string, string> = {
  emergency: '应急金',
  crash_ammo: '暴跌弹药池',
  dividend_pool: '收息股池',
  futu_usd: '富途美元池',
  value: '价值存量仓',
  dividend: '收息股仓',
  legacy: '存量仓',
  dca: '定投仓',
};

export function AssetPieChart() {
  const { holdings, pools, exchangeRates } = useStore();

  const holdingsByCat = holdings.reduce<Record<string, number>>((acc, h) => {
    const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
    const val = toCNY(price * h.quantity, h.currency, exchangeRates);
    acc[h.category] = (acc[h.category] ?? 0) + val;
    return acc;
  }, {});

  const poolData = pools.map((p) => ({
    name: LAYER_LABELS[p.name] ?? p.label,
    value: toCNY(p.balance, p.currency, exchangeRates),
  }));

  const holdingData = Object.entries(holdingsByCat).map(([cat, val]) => ({
    name: LAYER_LABELS[cat] ?? cat,
    value: val,
  }));

  const data = [...holdingData, ...poolData].filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) return null;

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value), 'CNY'), '']}
          />
          <Legend
            formatter={(value, entry) => {
              const payload = entry.payload as Record<string, unknown> | undefined;
              const v = Number(payload?.value ?? 0);
              const pct = total > 0 ? (v / total) * 100 : 0;
              return `${value} ${formatPct(pct)}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
