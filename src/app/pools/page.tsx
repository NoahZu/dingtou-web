'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PoolCards } from '@/components/pools/pool-cards';
import { PoolTransferDialog } from '@/components/pools/pool-transfer-dialog';
import { PoolTransferHistory } from '@/components/pools/pool-transfer-history';
import { SalaryAllocation } from '@/components/pools/salary-allocation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeftRight } from 'lucide-react';

export default function PoolsPage() {
  const { initialized } = useStore();
  const [showTransfer, setShowTransfer] = useState(false);

  if (!initialized) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold md:text-2xl">资金池管理</h1>
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
          <h1 className="text-xl font-bold md:text-2xl">资金池管理</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            文档第 6 节 · 四个池子专款专用 · 低于警戒线红色提醒
          </p>
        </div>
        <Button size="sm" onClick={() => setShowTransfer(true)}>
          <ArrowLeftRight className="mr-1 h-4 w-4" />
          池间转账
        </Button>
      </div>

      <PoolCards />

      <SalaryAllocation />

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="text-xs md:text-sm">转账记录</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <PoolTransferHistory />
        </TabsContent>
      </Tabs>

      <PoolTransferDialog open={showTransfer} onClose={() => setShowTransfer(false)} />
    </div>
  );
}
