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
import { formatCurrency } from '@/lib/format';
import { GUARDRAILS } from '@/config/strategy';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AccumulatorActionDialog({ open, onClose }: Props) {
  const { accumulators, addAccumulatorEntry, pools, updatePoolBalance } = useStore();
  const [selectedId, setSelectedId] = useState('');
  const [action, setAction] = useState<'add' | 'buy'>('add');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const selected = accumulators.find((a) => a.id === selectedId);
  const dividendPool = pools.find((p) => p.name === 'dividend_pool');

  const handleSubmit = () => {
    if (!selectedId || !amount) return;
    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    if (action === 'add') {
      addAccumulatorEntry(selectedId, {
        date: new Date().toISOString(),
        amount: numAmount,
        action: 'add',
        note: note || '手动累积',
      });
      toast.success(`已向 ${selected?.name} 累积 ${formatCurrency(numAmount, 'CNY')}`);
    } else {
      // 买入：扣减累积账户，同时扣减收息股池
      addAccumulatorEntry(selectedId, {
        date: new Date().toISOString(),
        amount: numAmount,
        action: 'buy',
        note: note || '累积买入',
      });
      if (dividendPool) {
        updatePoolBalance('dividend_pool', Math.max(0, dividendPool.balance - numAmount));
      }
      toast.success(`已从 ${selected?.name} 累积账户执行买入 ${formatCurrency(numAmount, 'CNY')}`);
    }

    setAmount('');
    setNote('');
    onClose();
  };

  const canBuyHint = selected
    ? selected.accumulatedCNY >= selected.lotValueCNY * (GUARDRAILS.accumulatorBuyThresholdPct / 100)
    : false;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>累积账户操作</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>选择标的</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="选择累积账户" /></SelectTrigger>
              <SelectContent>
                {accumulators.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}（累积 {formatCurrency(a.accumulatedCNY, 'CNY')}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>操作类型</Label>
            <Select value={action} onValueChange={(v) => setAction(v as 'add' | 'buy')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="add">添加累积</SelectItem>
                <SelectItem value="buy">执行买入（扣减累积）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selected && action === 'buy' && canBuyHint && (
            <div className="rounded bg-green-50 p-2 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
              当前累积 {formatCurrency(selected.accumulatedCNY, 'CNY')} 已达一手
              {formatCurrency(selected.lotValueCNY, 'CNY')} 的 {GUARDRAILS.accumulatorBuyThresholdPct}%，可执行买入
            </div>
          )}

          <div className="space-y-2">
            <Label>金额 (CNY)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={action === 'buy' && selected
                ? `建议 ${selected.lotValueCNY}（一手）`
                : '输入累积金额'}
            />
          </div>

          <div className="space-y-2">
            <Label>备注</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="可选" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!selectedId || !amount || Number(amount) <= 0}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
