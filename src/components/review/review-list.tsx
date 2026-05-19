'use client';

import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/format';
import { getPeriodLabel, getTemplateByPeriod } from '@/config/review-templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function ReviewList() {
  const { reviews, deleteReview } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...(reviews ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">暂无复盘报告，点击上方按钮创建</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((review) => {
        const expanded = expandedId === review.id;
        const template = getTemplateByPeriod(review.period);
        const completedCount = review.checklist.length;

        return (
          <Card key={review.id}>
            <CardHeader
              className="cursor-pointer pb-3"
              onClick={() => setExpandedId(expanded ? null : review.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{review.label}</CardTitle>
                  <Badge variant="outline">{getPeriodLabel(review.period)}</Badge>
                  <Badge variant="secondary">
                    {completedCount}/{template.length} 项
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>

            {expanded && (
              <CardContent className="space-y-4 pt-0">
                {/* 快照数据 */}
                {review.totalAssets && (
                  <div className="flex gap-6 text-sm">
                    <span>总资产：<strong>{formatCurrency(review.totalAssets, 'CNY')}</strong></span>
                    {review.marketValue && (
                      <span>市值：{formatCurrency(review.marketValue, 'CNY')}</span>
                    )}
                    {review.cashTotal && (
                      <span>现金：{formatCurrency(review.cashTotal, 'CNY')}</span>
                    )}
                  </div>
                )}

                {/* 检查清单 */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">检查清单</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {template.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span>{review.checklist.includes(item.id) ? '✅' : '⬜'}</span>
                        <span className={review.checklist.includes(item.id) ? '' : 'text-muted-foreground'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 笔记 */}
                {review.notes && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">心理日记 / 笔记</p>
                    <div className="whitespace-pre-wrap rounded bg-muted p-3 text-sm">
                      {review.notes}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="ghost" size="sm" className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定删除此复盘报告？')) deleteReview(review.id);
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    删除
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
