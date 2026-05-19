'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getTemplateByPeriod, getPeriodLabel } from '@/config/review-templates';
import { toast } from 'sonner';
import { toCNY } from '@/lib/format';
import type { ReviewPeriod } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ReviewForm({ open, onClose }: Props) {
  const { addReview, holdings, pools, exchangeRates } = useStore();

  const now = new Date();
  const [period, setPeriod] = useState<ReviewPeriod>('monthly');
  const [label, setLabel] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [notes, setNotes] = useState('');
  const [checked, setChecked] = useState<string[]>([]);

  const template = getTemplateByPeriod(period);

  const toggleCheck = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const totalMV = holdings.reduce((s, h) => {
      const p = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
      return s + toCNY(p * h.quantity, h.currency, exchangeRates);
    }, 0);
    const totalCash = pools.reduce((s, p) => s + toCNY(p.balance, p.currency, exchangeRates), 0);

    addReview({
      period,
      label,
      createdAt: new Date().toISOString(),
      totalAssets: totalMV + totalCash,
      marketValue: totalMV,
      cashTotal: totalCash,
      notes,
      checklist: checked,
    });

    toast.success(`${getPeriodLabel(period)} (${label}) 已保存`);
    setNotes('');
    setChecked([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建复盘报告</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as ReviewPeriod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">月度复盘</SelectItem>
                  <SelectItem value="quarterly">季度复盘</SelectItem>
                  <SelectItem value="yearly">年度审视</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>标签</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="如 2026-06" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>检查清单（{getPeriodLabel(period)}）</Label>
            <div className="space-y-1.5 rounded border p-3 max-h-[200px] overflow-y-auto">
              {template.map((item) => (
                <label key={item.id} className="flex items-start gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={checked.includes(item.id)}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-0.5 rounded"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {checked.length} / {template.length} 项已完成
            </p>
          </div>

          <div className="space-y-2">
            <Label>心理日记 / 复盘笔记</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录本期的市场感悟、情绪变化、规则执行情况..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存报告</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
