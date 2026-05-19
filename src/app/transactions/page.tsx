'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionList } from '@/components/transactions/transaction-list';
import { Plus, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TransactionsPage() {
  const { initialized } = useStore();
  const [showForm, setShowForm] = useState(false);

  if (!initialized) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold md:text-2xl">交易记录</h1>
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
          <h1 className="text-xl font-bold md:text-2xl">交易记录</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            录入买卖操作，自动关联持仓和资金池
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          录入交易
        </Button>
      </div>

      <TransactionList />

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
