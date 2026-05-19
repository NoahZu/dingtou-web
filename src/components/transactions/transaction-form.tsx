'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { TransactionType, Account, Currency } from '@/lib/types';
import { SYMBOL_NAMES } from '@/config/strategy';

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: {
    symbol?: string;
    side?: 'buy' | 'sell';
    type?: TransactionType;
    quantity?: number;
    price?: number;
  };
}

const TX_TYPE_LABELS: Record<TransactionType, string> = {
  dca: '月度定投',
  trigger_buy: '触发加仓',
  accumulator_buy: '累积买入',
  value_add: '价值仓加仓',
  reduce: '减仓',
  dividend: '分红再投资',
};

export function TransactionForm({ open, onClose, prefill }: Props) {
  const { holdings, addTransaction, updateHolding } = useStore();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    symbol: '',
    name: '',
    side: 'buy' as 'buy' | 'sell',
    type: 'trigger_buy' as TransactionType,
    quantity: '',
    price: '',
    fee: '0',
    account: 'xueqiu' as Account,
    currency: 'HKD' as Currency,
    note: '',
  });

  useEffect(() => {
    if (prefill) {
      setForm((f) => ({
        ...f,
        symbol: prefill.symbol ?? f.symbol,
        name: SYMBOL_NAMES[prefill.symbol ?? ''] ?? f.name,
        side: prefill.side ?? f.side,
        type: prefill.type ?? f.type,
        quantity: prefill.quantity ? String(prefill.quantity) : f.quantity,
        price: prefill.price ? String(prefill.price) : f.price,
      }));
    }
  }, [prefill, open]);

  const handleSymbolChange = (val: string) => {
    const upper = val.toUpperCase();
    const existing = holdings.find((h) => h.symbol === upper);
    setForm((f) => ({
      ...f,
      symbol: upper,
      name: SYMBOL_NAMES[upper] ?? existing?.name ?? f.name,
      currency: existing?.currency ?? f.currency,
      account: existing?.account ?? f.account,
    }));
  };

  const handleSubmit = () => {
    const qty = Number(form.quantity);
    const price = Number(form.price);
    const fee = Number(form.fee);

    if (!form.symbol || qty <= 0 || price <= 0) {
      toast.error('请填写必要字段');
      return;
    }

    addTransaction({
      date: form.date,
      type: form.type,
      symbol: form.symbol,
      name: form.name || SYMBOL_NAMES[form.symbol] || form.symbol,
      side: form.side,
      quantity: qty,
      price,
      fee,
      currency: form.currency,
      account: form.account,
      note: form.note || undefined,
    });

    // 自动更新持仓
    const holding = holdings.find((h) => h.symbol === form.symbol);
    if (holding) {
      if (form.side === 'buy') {
        const totalCost = holding.avgCost * holding.quantity + price * qty;
        const totalQty = holding.quantity + qty;
        updateHolding(holding.id, {
          quantity: totalQty,
          avgCost: totalCost / totalQty,
          currentPrice: price,
        });
      } else {
        updateHolding(holding.id, {
          quantity: Math.max(0, holding.quantity - qty),
          currentPrice: price,
        });
      }
    }

    toast.success(`交易已记录: ${form.side === 'buy' ? '买入' : '卖出'} ${form.name || form.symbol}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>录入交易</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>日期</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>交易类型</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TransactionType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TX_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>代码</Label>
              <Input
                value={form.symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                placeholder="如 0883.HK"
              />
            </div>
            <div className="space-y-2">
              <Label>名称</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>买/卖</Label>
              <Select value={form.side} onValueChange={(v) => setForm({ ...form, side: v as 'buy' | 'sell' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">买入</SelectItem>
                  <SelectItem value="sell">卖出</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>数量</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>价格</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>手续费</Label>
              <Input
                type="number"
                step="0.01"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>币种</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as Currency })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HKD">HKD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>账户</Label>
              <Select value={form.account} onValueChange={(v) => setForm({ ...form, account: v as Account })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="futu">富途</SelectItem>
                  <SelectItem value="xueqiu">雪球</SelectItem>
                  <SelectItem value="webank">微众</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>备注</Label>
            <Input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="可选"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>确认录入</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
