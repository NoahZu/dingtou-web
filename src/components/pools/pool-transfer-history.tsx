'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { PoolName } from '@/lib/types';

const POOL_LABELS: Record<PoolName | 'external', string> = {
  emergency: '应急金',
  crash_ammo: '暴跌弹药池',
  dividend_pool: '收息股池',
  futu_usd: '富途美元池',
  external: '外部',
};

export function PoolTransferHistory() {
  const { poolTransfers, deletePoolTransfer } = useStore();

  const sorted = [...(poolTransfers ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">暂无转账记录</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日期</TableHead>
            <TableHead>从</TableHead>
            <TableHead>到</TableHead>
            <TableHead className="text-right">金额</TableHead>
            <TableHead>备注</TableHead>
            <TableHead className="text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{formatDate(t.date)}</TableCell>
              <TableCell>{POOL_LABELS[t.from] ?? t.from}</TableCell>
              <TableCell>{POOL_LABELS[t.to] ?? t.to}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(t.amount, t.currency)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                {t.note}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost" size="icon" className="text-destructive"
                  onClick={() => {
                    if (confirm('删除此转账记录？（不会自动回退余额）')) {
                      deletePoolTransfer(t.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
