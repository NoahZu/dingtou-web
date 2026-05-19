'use client';

import { useStore } from '@/lib/store';
import { formatCurrencyPrecise, formatDate, formatNumber } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { TransactionType } from '@/lib/types';

const TX_TYPE_CONFIG: Record<TransactionType, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  dca: { label: '定投', variant: 'default' },
  trigger_buy: { label: '触发加仓', variant: 'secondary' },
  accumulator_buy: { label: '累积买入', variant: 'outline' },
  value_add: { label: '价值仓', variant: 'secondary' },
  reduce: { label: '减仓', variant: 'destructive' },
  dividend: { label: '分红', variant: 'outline' },
};

export function TransactionList() {
  const { transactions, deleteTransaction } = useStore();

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">暂无交易记录</p>
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* 移动端卡片 */}
      <div className="space-y-3 md:hidden">
        {sorted.map((tx) => {
          const config = TX_TYPE_CONFIG[tx.type];
          const total = tx.quantity * tx.price;
          return (
            <div key={tx.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tx.name}</span>
                  <Badge variant={tx.side === 'buy' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                    {tx.side === 'buy' ? '买' : '卖'}
                  </Badge>
                  <Badge variant={config.variant} className="text-[10px] px-1.5 py-0">
                    {config.label}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                  onClick={() => { if (confirm('确定删除？')) deleteTransaction(tx.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold">
                  {formatCurrencyPrecise(total, tx.currency)}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span>数量 </span>
                  <span className="text-foreground">{formatNumber(tx.quantity)}</span>
                </div>
                <div>
                  <span>价格 </span>
                  <span className="text-foreground">{formatCurrencyPrecise(tx.price, tx.currency)}</span>
                </div>
              </div>
              {tx.note && (
                <p className="text-[10px] text-muted-foreground truncate">{tx.note}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* 桌面端表格 */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>标的</TableHead>
              <TableHead>方向</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">价格</TableHead>
              <TableHead className="text-right">金额</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>备注</TableHead>
              <TableHead className="text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((tx) => {
              const config = TX_TYPE_CONFIG[tx.type];
              const total = tx.quantity * tx.price;
              return (
                <TableRow key={tx.id}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell className="font-medium">
                    {tx.name}
                    <span className="ml-1 text-xs text-muted-foreground">{tx.symbol}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.side === 'buy' ? 'default' : 'destructive'}>
                      {tx.side === 'buy' ? '买入' : '卖出'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(tx.quantity)}</TableCell>
                  <TableCell className="text-right">{formatCurrencyPrecise(tx.price, tx.currency)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrencyPrecise(total, tx.currency)}</TableCell>
                  <TableCell><Badge variant={config.variant}>{config.label}</Badge></TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                    {tx.note ?? '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="text-destructive"
                      onClick={() => { if (confirm('确定删除这条交易记录？')) deleteTransaction(tx.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
