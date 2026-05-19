'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccumulatorTable } from '@/components/accumulator/accumulator-table';
import { AccumulatorActionDialog } from '@/components/accumulator/accumulator-actions';
import { AccumulatorHistory } from '@/components/accumulator/accumulator-history';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Plus } from 'lucide-react';

export default function AccumulatorPage() {
  const { initialized } = useStore();
  const [showAction, setShowAction] = useState(false);

  if (!initialized) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold md:text-2xl">累积账户</h1>
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
          <h1 className="text-xl font-bold md:text-2xl">累积账户</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            文档 4.5 节 · 港股整手交易的累积机制 · 累积 ≥ 一手 90% 即可买入
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAction(true)}>
          <Plus className="mr-1 h-4 w-4" />
          添加操作
        </Button>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts" className="text-xs md:text-sm">累积账户</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">操作记录</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccumulatorTable />
        </TabsContent>

        <TabsContent value="history">
          <AccumulatorHistory />
        </TabsContent>
      </Tabs>

      <AccumulatorActionDialog open={showAction} onClose={() => setShowAction(false)} />
    </div>
  );
}
