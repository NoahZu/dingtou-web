'use client';

import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

export function DCACalendar() {
  const { dcaExecutions } = useStore();
  const executions = dcaExecutions ?? [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 生成过去 12 个月
  const months: { key: string; label: string; year: number; month: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      key,
      label: `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  const executionMap = new Map(
    executions.map((e) => [e.month, e])
  );

  // 过去的月份如果未执行标记为漏掉
  const isPast = (year: number, month: number) => {
    const d = new Date(year, month, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), 1);
    return d < today;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">近 12 个月执行日历</h3>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
        {months.map(({ key, label, year, month }) => {
          const exec = executionMap.get(key);
          const past = isPast(year, month);
          const isCurrent = year === now.getFullYear() && month === now.getMonth();

          let status: 'executed' | 'missed' | 'pending' = 'pending';
          if (exec) status = 'executed';
          else if (past) status = 'missed';

          return (
            <div
              key={key}
              className={cn(
                'flex flex-col items-center rounded-lg border p-2 text-center transition-colors',
                status === 'executed' && 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
                status === 'missed' && 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
                status === 'pending' && 'border-dashed',
                isCurrent && 'ring-2 ring-primary',
              )}
            >
              <span className="text-xs font-medium">{label}</span>
              <span className="mt-1 text-lg">
                {status === 'executed' ? '✅' : status === 'missed' ? '❌' : '⏳'}
              </span>
              {exec && (
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatCurrency(exec.totalAmount, 'CNY')}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>✅ 已执行</span>
        <span>❌ 漏掉</span>
        <span>⏳ 待执行</span>
      </div>
    </div>
  );
}
