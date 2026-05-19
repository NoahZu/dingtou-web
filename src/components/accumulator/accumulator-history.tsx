'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function AccumulatorHistory() {
  const { accumulators } = useStore();

  const allEntries = accumulators.flatMap((acc) =>
    acc.history.map((entry) => ({ ...entry, accName: acc.name, accSymbol: acc.symbol }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allEntries.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">暂无操作记录</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日期</TableHead>
            <TableHead>标的</TableHead>
            <TableHead>操作</TableHead>
            <TableHead className="text-right">金额</TableHead>
            <TableHead>备注</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allEntries.map((entry, i) => (
            <TableRow key={`${entry.date}-${i}`}>
              <TableCell>{formatDate(entry.date)}</TableCell>
              <TableCell className="font-medium">
                {entry.accName}
                <span className="ml-1 text-xs text-muted-foreground">{entry.accSymbol}</span>
              </TableCell>
              <TableCell>
                <Badge variant={entry.action === 'add' ? 'secondary' : 'default'}>
                  {entry.action === 'add' ? '累积' : '买入'}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(entry.amount, 'CNY')}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {entry.note ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
