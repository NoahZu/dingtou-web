'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, formatCurrencyPrecise, formatPct, formatNumber, toCNY } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import type { Holding, HoldingCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<HoldingCategory, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  dca: { label: '定投仓', variant: 'default' },
  value: { label: '价值仓', variant: 'secondary' },
  dividend: { label: '收息仓', variant: 'outline' },
  legacy: { label: '存量仓', variant: 'destructive' },
};

interface Props {
  onEdit: (holding: Holding) => void;
}

export function HoldingsTable({ onEdit }: Props) {
  const { holdings, exchangeRates, deleteHolding } = useStore();

  const totalAssetsCNY = holdings.reduce((sum, h) => {
    const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
    return sum + toCNY(price * h.quantity, h.currency, exchangeRates);
  }, 0);

  const sorted = [...holdings].sort((a, b) => {
    const mvA = toCNY((a.currentPrice || a.avgCost) * a.quantity, a.currency, exchangeRates);
    const mvB = toCNY((b.currentPrice || b.avgCost) * b.quantity, b.currency, exchangeRates);
    return mvB - mvA;
  });

  if (sorted.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">暂无持仓数据，请点击「一键初始化」或手动添加</p>
      </div>
    );
  }

  return (
    <>
      {/* 移动端卡片视图 */}
      <div className="space-y-3 md:hidden">
        {sorted.map((h) => {
          const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
          const marketValueCNY = toCNY(price * h.quantity, h.currency, exchangeRates);
          const pnlPct = h.currentPrice > 0
            ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100
            : 0;
          const weightPct = totalAssetsCNY > 0 ? (marketValueCNY / totalAssetsCNY) * 100 : 0;
          const cat = CATEGORY_LABELS[h.category];

          return (
            <div key={h.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{h.name}</span>
                  <Badge variant={cat.variant} className="text-[10px] px-1.5 py-0">{cat.label}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(h)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                    onClick={() => { if (confirm(`确定删除 ${h.name}？`)) deleteHolding(h.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold">{formatCurrency(marketValueCNY, 'CNY')}</span>
                <span className={`text-sm font-medium ${
                  pnlPct > 0 ? 'text-red-600' : pnlPct < 0 ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  {h.currentPrice > 0 ? `${pnlPct > 0 ? '+' : ''}${formatPct(pnlPct)}` : '未录价'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block">数量</span>
                  <span className="text-foreground">{formatNumber(h.quantity)}</span>
                </div>
                <div>
                  <span className="block">成本</span>
                  <span className="text-foreground">{formatCurrencyPrecise(h.avgCost, h.currency)}</span>
                </div>
                <div>
                  <span className="block">占比</span>
                  <span className="text-foreground">{formatPct(weightPct)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 桌面端表格视图 */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标的</TableHead>
              <TableHead>代码</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">成本价</TableHead>
              <TableHead className="text-right">现价</TableHead>
              <TableHead className="text-right">市值(CNY)</TableHead>
              <TableHead className="text-right">浮盈%</TableHead>
              <TableHead className="text-right">占比%</TableHead>
              <TableHead>类型</TableHead>
              <TableHead className="text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((h) => {
              const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
              const marketValueCNY = toCNY(price * h.quantity, h.currency, exchangeRates);
              const pnlPct = h.currentPrice > 0
                ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100
                : 0;
              const weightPct = totalAssetsCNY > 0 ? (marketValueCNY / totalAssetsCNY) * 100 : 0;
              const cat = CATEGORY_LABELS[h.category];

              return (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell className="text-muted-foreground">{h.symbol}</TableCell>
                  <TableCell className="text-right">{formatNumber(h.quantity)}</TableCell>
                  <TableCell className="text-right">{formatCurrencyPrecise(h.avgCost, h.currency)}</TableCell>
                  <TableCell className="text-right">
                    {h.currentPrice > 0
                      ? formatCurrencyPrecise(h.currentPrice, h.currency)
                      : <span className="text-muted-foreground">未录入</span>}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(marketValueCNY, 'CNY')}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    pnlPct > 0 ? 'text-red-600' : pnlPct < 0 ? 'text-green-600' : ''
                  }`}>
                    {h.currentPrice > 0 ? `${pnlPct > 0 ? '+' : ''}${formatPct(pnlPct)}` : '—'}
                  </TableCell>
                  <TableCell className="text-right">{formatPct(weightPct)}</TableCell>
                  <TableCell><Badge variant={cat.variant}>{cat.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(h)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive"
                        onClick={() => { if (confirm(`确定删除 ${h.name}？`)) deleteHolding(h.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
