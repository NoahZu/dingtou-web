'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { DCAPlanTable } from '@/components/dca/dca-plan-table';
import { DCAExecuteDialog } from '@/components/dca/dca-execute-dialog';
import { DCACalendar } from '@/components/dca/dca-calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Play } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function DCAPage() {
  const { initialized } = useStore();
  const [showExecute, setShowExecute] = useState(false);

  if (!initialized) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold md:text-2xl">定投计划</h1>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>请先前往持仓管理页面完成数据初始化</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">定投计划</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            文档 3.1 节 · 每月 1 号执行 · 4 只 ETF + 现金留存 · ¥15,000/月
          </p>
        </div>
        <Button size="sm" onClick={() => setShowExecute(true)}>
          <Play className="mr-1 h-4 w-4" />
          执行本月定投
        </Button>
      </div>

      <DCAPlanTable />

      <Separator />

      <DCACalendar />

      <DCAExecuteDialog open={showExecute} onClose={() => setShowExecute(false)} />
    </div>
  );
}
