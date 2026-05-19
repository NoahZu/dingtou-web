'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/components/review/review-form';
import { ReviewList } from '@/components/review/review-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Plus } from 'lucide-react';

export default function ReviewPage() {
  const { initialized } = useStore();
  const [showForm, setShowForm] = useState(false);

  if (!initialized) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold md:text-2xl">复盘报告</h1>
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
          <h1 className="text-xl font-bold md:text-2xl">复盘报告</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            文档第 8 节 · 月度执行 / 季度复盘 / 年度审视
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          新建复盘
        </Button>
      </div>

      <ReviewList />

      <ReviewForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
