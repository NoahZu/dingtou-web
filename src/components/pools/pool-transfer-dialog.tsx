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
import { toast } from 'sonner';
import type { PoolName } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const POOL_OPTIONS: { value: PoolName | 'external'; label: string }[] = [
  { value: 'emergency', label: '应急金' },
  { value: 'crash_ammo', label: '暴跌弹药池' },
  { value: 'dividend_pool', label: '收息股加仓池' },
  { value: 'futu_usd', label: '富途美元池' },
  { value: 'external', label: '外部（工资/股息等）' },
];

export function PoolTransferDialog({ open, onClose }: Props) {
  const { addPoolTransfer, pools } = useStore();
  const [from, setFrom] = useState<string>('external');
  const [to, setTo] = useState<string>('crash_ammo');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    const num = Number(amount);
    if (num <= 0 || from === to) {
      toast.error('请检查输入');
      return;
    }

    // 检查来源池余额
    if (from !== 'external') {
      const sourcePool = pools.find((p) => p.name === from);
      if (sourcePool && sourcePool.balance < num) {
        toast.error(`${sourcePool.label} 余额不足`);
        return;
      }
      if (sourcePool?.locked) {
        toast.error(`${sourcePool.label} 已锁定，不可转出`);
        return;
      }
    }

    addPoolTransfer({
      date: new Date().toISOString(),
      from: from as PoolName | 'external',
      to: to as PoolName | 'external',
      amount: num,
      currency: 'CNY',
      note: note || `${POOL_OPTIONS.find((o) => o.value === from)?.label} → ${POOL_OPTIONS.find((o) => o.value === to)?.label}`,
    });

    toast.success('转账已记录');
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>资金池转账</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>从</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POOL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>到</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POOL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>金额 (CNY)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="转账金额"
            />
          </div>

          <div className="space-y-2">
            <Label>备注</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="如：6月工资超额分配" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!amount || Number(amount) <= 0 || from === to}>
            确认转账
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
