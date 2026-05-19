'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, AlertCircle } from 'lucide-react';

export function MonthlyTodos() {
  const { dcaExecutions, accumulators } = useStore();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const dcaDone = (dcaExecutions ?? []).some((e) => e.month === currentMonth);

  const pendingAccumulators = (accumulators ?? []).filter((a) => a.accumulatedCNY > 0);

  const items: { text: string; done: boolean; urgent: boolean }[] = [
    {
      text: `${currentMonth} 月定投`,
      done: dcaDone,
      urgent: !dcaDone && now.getDate() >= 1,
    },
    ...pendingAccumulators.map((a) => ({
      text: `${a.name} 累积中 (¥${a.accumulatedCNY.toLocaleString()})`,
      done: false,
      urgent: false,
    })),
  ];

  // 每月 1 号检查收息股股息率
  if (now.getDate() <= 3) {
    items.push({
      text: '检查 5 只收息股股息率',
      done: false,
      urgent: true,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck className="h-4 w-4" />
          本月待办
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">本月暂无待办</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <Badge variant="outline" className="text-green-600 border-green-300">已完成</Badge>
                ) : item.urgent ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    待执行
                  </Badge>
                ) : (
                  <Badge variant="secondary">进行中</Badge>
                )}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
