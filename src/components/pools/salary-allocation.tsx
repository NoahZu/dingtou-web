'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MONTHLY_DCA_TOTAL, SALARY_OVERFLOW } from '@/config/strategy';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';

export function SalaryAllocation() {
  const { addPoolTransfer } = useStore();
  const [salary, setSalary] = useState('');

  const salaryNum = Number(salary) || 0;
  const overflow = Math.max(0, salaryNum - MONTHLY_DCA_TOTAL);
  const toCrash = Math.round(overflow * SALARY_OVERFLOW.crashAmmoPct / 100);
  const toDividend = overflow - toCrash;

  const handleAllocate = () => {
    if (overflow <= 0) {
      toast.info('无超额部分需要分配');
      return;
    }

    const today = new Date().toISOString();
    if (toCrash > 0) {
      addPoolTransfer({
        date: today,
        from: 'external',
        to: 'crash_ammo',
        amount: toCrash,
        currency: 'CNY',
        note: `工资超额 ${SALARY_OVERFLOW.crashAmmoPct}% → 暴跌弹药池`,
      });
    }
    if (toDividend > 0) {
      addPoolTransfer({
        date: today,
        from: 'external',
        to: 'dividend_pool',
        amount: toDividend,
        currency: 'CNY',
        note: `工资超额 ${SALARY_OVERFLOW.dividendPoolPct}% → 收息股池`,
      });
    }
    toast.success(`已分配：弹药池 +${formatCurrency(toCrash, 'CNY')}，收息股池 +${formatCurrency(toDividend, 'CNY')}`);
    setSalary('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          工资超额分配
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            文档 3.3 节 · 超出 ¥15,000 部分按 60/40 分配
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="space-y-2">
            <Label>本月可投资金</Label>
            <Input
              type="number"
              className="w-40"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="如 20000"
            />
          </div>
          <Button onClick={handleAllocate} disabled={overflow <= 0}>
            执行分配
          </Button>
        </div>

        {salaryNum > 0 && (
          <div className="rounded bg-muted p-3 text-sm space-y-1">
            <p>定投部分：{formatCurrency(Math.min(salaryNum, MONTHLY_DCA_TOTAL), 'CNY')}</p>
            {overflow > 0 ? (
              <>
                <p>超额部分：{formatCurrency(overflow, 'CNY')}</p>
                <p className="text-orange-600">
                  → 暴跌弹药池 60%：{formatCurrency(toCrash, 'CNY')}
                </p>
                <p className="text-green-600">
                  → 收息股池 40%：{formatCurrency(toDividend, 'CNY')}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">无超额，全部用于定投</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
