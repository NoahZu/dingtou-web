'use client';

import { DCA_PLAN, MONTHLY_DCA_TOTAL } from '@/config/strategy';
import { formatCurrency, formatPct } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from '@/components/ui/table';

export function DCAPlanTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标的</TableHead>
            <TableHead>代码</TableHead>
            <TableHead className="text-right">每月金额</TableHead>
            <TableHead className="text-right">占比</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DCA_PLAN.map((item) => (
            <TableRow key={item.symbol}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.symbol}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.amount, 'CNY')}
              </TableCell>
              <TableCell className="text-right">
                {formatPct(item.pct)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-medium">合计</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(MONTHLY_DCA_TOTAL, 'CNY')}
            </TableCell>
            <TableCell className="text-right font-bold">100%</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
