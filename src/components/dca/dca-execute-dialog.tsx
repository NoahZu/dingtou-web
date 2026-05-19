'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { DCA_PLAN, MONTHLY_DCA_TOTAL } from '@/config/strategy';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DCAExecuteDialog({ open, onClose }: Props) {
  const { addDCAExecution, addTransaction, holdings } = useStore();
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [month, setMonth] = useState(defaultMonth);
  const [prices, setPrices] = useState<Record<string, string>>({});

  const etfItems = DCA_PLAN.filter((p) => p.symbol !== 'CASH');

  const handleExecute = () => {
    const items = etfItems.map((plan) => {
      const price = Number(prices[plan.symbol]) || 0;
      const quantity = price > 0 ? Math.floor(plan.amount / price) : 0;
      return {
        symbol: plan.symbol,
        name: plan.name,
        amount: plan.amount,
        price,
        quantity,
      };
    });

    // 记录定投执行
    addDCAExecution({
      month,
      executedAt: new Date().toISOString(),
      items,
      totalAmount: MONTHLY_DCA_TOTAL,
    });

    // 为每只 ETF 生成交易记录
    items.forEach((item) => {
      if (item.price > 0 && item.quantity > 0) {
        const holding = holdings.find((h) => h.symbol === item.symbol);
        addTransaction({
          date: new Date().toISOString(),
          type: 'dca',
          symbol: item.symbol,
          name: item.name,
          side: 'buy',
          quantity: item.quantity,
          price: item.price,
          fee: 0,
          currency: holding?.currency ?? 'HKD',
          account: holding?.account ?? 'xueqiu',
          note: `${month} 月度定投`,
        });
      }
    });

    toast.success(`${month} 月定投已执行，共 ${formatCurrency(MONTHLY_DCA_TOTAL, 'CNY')}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>执行月度定投</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>执行月份</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>各 ETF 当前价格（用于计算买入数量）</Label>
            {etfItems.map((plan) => (
              <div key={plan.symbol} className="flex items-center gap-3">
                <span className="w-36 text-sm">{plan.name}</span>
                <Input
                  type="number"
                  step="0.01"
                  className="w-28"
                  placeholder="现价"
                  value={prices[plan.symbol] ?? ''}
                  onChange={(e) => setPrices({ ...prices, [plan.symbol]: e.target.value })}
                />
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(plan.amount, 'CNY')}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded bg-muted p-3 text-sm">
            <p>现金留存：{formatCurrency(1000, 'CNY')}（自动进微众）</p>
            <p className="font-medium mt-1">
              本月定投合计：{formatCurrency(MONTHLY_DCA_TOTAL, 'CNY')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleExecute}>确认执行</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
