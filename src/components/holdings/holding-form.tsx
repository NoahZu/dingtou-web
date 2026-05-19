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
import type { Holding, Market, Currency, Account, HoldingCategory } from '@/lib/types';
import { LOT_SIZES, SYMBOL_NAMES } from '@/config/strategy';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Holding | null;
}

const MARKET_CURRENCIES: Record<Market, Currency> = { HK: 'HKD', US: 'USD', CN: 'CNY' };

export function HoldingForm({ open, onClose, editing }: Props) {
  const { addHolding, updateHolding } = useStore();

  const [form, setForm] = useState({
    symbol: '',
    name: '',
    market: 'HK' as Market,
    category: 'dividend' as HoldingCategory,
    quantity: '',
    avgCost: '',
    currentPrice: '',
    account: 'xueqiu' as Account,
    lotSize: '',
  });

  useEffect(() => {
    if (editing) {
      setForm({
        symbol: editing.symbol,
        name: editing.name,
        market: editing.market,
        category: editing.category,
        quantity: String(editing.quantity),
        avgCost: String(editing.avgCost),
        currentPrice: editing.currentPrice > 0 ? String(editing.currentPrice) : '',
        account: editing.account,
        lotSize: String(editing.lotSize),
      });
    } else {
      setForm({
        symbol: '', name: '', market: 'HK', category: 'dividend',
        quantity: '', avgCost: '', currentPrice: '', account: 'xueqiu', lotSize: '',
      });
    }
  }, [editing, open]);

  const handleSymbolChange = (val: string) => {
    const upper = val.toUpperCase();
    setForm((f) => ({
      ...f,
      symbol: upper,
      name: SYMBOL_NAMES[upper] ?? f.name,
      lotSize: LOT_SIZES[upper] ? String(LOT_SIZES[upper]) : f.lotSize,
    }));
  };

  const handleSubmit = () => {
    const currency = MARKET_CURRENCIES[form.market];
    const data = {
      symbol: form.symbol,
      name: form.name,
      market: form.market,
      category: form.category,
      quantity: Number(form.quantity),
      avgCost: Number(form.avgCost),
      currentPrice: form.currentPrice ? Number(form.currentPrice) : 0,
      currency,
      account: form.account,
      lotSize: Number(form.lotSize) || 1,
    };

    if (editing) {
      updateHolding(editing.id, data);
    } else {
      addHolding(data);
    }
    onClose();
  };

  const isValid = form.symbol && form.name && Number(form.quantity) > 0 && Number(form.avgCost) > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑持仓' : '添加持仓'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
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
                placeholder="中国海洋石油"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>市场</Label>
              <Select value={form.market} onValueChange={(v) => setForm({ ...form, market: v as Market })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HK">港股</SelectItem>
                  <SelectItem value="US">美股</SelectItem>
                  <SelectItem value="CN">A股</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as HoldingCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dca">定投仓</SelectItem>
                  <SelectItem value="value">价值仓</SelectItem>
                  <SelectItem value="dividend">收息仓</SelectItem>
                  <SelectItem value="legacy">存量仓</SelectItem>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>数量</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>平均成本</Label>
              <Input
                type="number"
                step="0.01"
                value={form.avgCost}
                onChange={(e) => setForm({ ...form, avgCost: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>现价（可选）</Label>
              <Input
                type="number"
                step="0.01"
                value={form.currentPrice}
                onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
                placeholder="手动录入"
              />
            </div>
            <div className="space-y-2">
              <Label>一手股数</Label>
              <Input
                type="number"
                value={form.lotSize}
                onChange={(e) => setForm({ ...form, lotSize: e.target.value })}
                placeholder="港股一手"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {editing ? '保存修改' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
